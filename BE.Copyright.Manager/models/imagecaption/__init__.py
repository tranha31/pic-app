import numpy as np
from numpy import array
import pandas as pd
import matplotlib.pyplot as plt
import string
import os
from PIL import Image
import glob
from pickle import dump, load
from time import time
from keras.preprocessing import sequence
from keras.models import Sequential
from keras.layers import LSTM, Embedding, TimeDistributed, Dense, RepeatVector,\
                         Activation, Flatten, Reshape, concatenate, Dropout, BatchNormalization
from keras.optimizers import Adam, RMSprop
from keras.layers import Bidirectional
from keras.layers import add
from keras.applications.inception_v3 import InceptionV3
#from keras.preprocessing import image
from keras.models import Model
from keras import Input, layers
from keras import optimizers
from keras.applications.inception_v3 import preprocess_input
from keras.preprocessing.text import Tokenizer
from keras.utils import pad_sequences
from keras.utils import to_categorical
import keras.utils as image

class ImageCaption:

    vocab_size = 0
    modelEncodeImage = None
    modelPredictCaption = None
    embeddings_index = {}
    embedding_dim = 200
    embedding_matrix = None
    max_length = 34
    wordtoix = {}
    ixtoword = {}


    def __init__(self) -> None:
        self.createModelEncodeImage()
        pass

    def createModelEncodeImage(self):
        # Init model encode ảnh
        model = InceptionV3(weights='imagenet')
        self.modelEncodeImage = Model(model.input, model.layers[-2].output)

        self.loadDictionary()
        self.loadGloveModel()
        self.handleInitGloveModel()

        # Init model dự đoán caption
        inputs1 = Input(shape=(2048,))
        fe1 = Dropout(0.5)(inputs1)
        fe2 = Dense(256, activation='relu')(fe1)
        inputs2 = Input(shape=(self.max_length,))
        se1 = Embedding(self.vocab_size, self.embedding_dim, mask_zero=True)(inputs2)
        se2 = Dropout(0.5)(se1)
        se3 = LSTM(256)(se2)
        decoder1 = add([fe2, se3])
        decoder2 = Dense(256, activation='relu')(decoder1)
        outputs = Dense(self.vocab_size, activation='softmax')(decoder2)
        self.modelPredictCaption = Model(inputs=[inputs1, inputs2], outputs=outputs)

        # Layer 2 dùng GLOVE Model nên set weight thẳng và không cần train
        self.modelPredictCaption.layers[2].set_weights([self.embedding_matrix])
        self.modelPredictCaption.layers[2].trainable = False
        self.modelPredictCaption.compile(loss='categorical_crossentropy', optimizer='adam')
        self.modelPredictCaption.load_weights('./models/imagecaption/model_30_200_0.h5')

    # Load ảnh, resize về khích thước mà Inception v3 yêu cầu.
    def preprocess(self, imageI):
        imageI = imageI.resize((299, 299), Image.ANTIALIAS)
        rgb = imageI.convert('RGB')
        x = image.img_to_array(rgb)
        # Add one more dimension
        x = np.expand_dims(x, axis=0)
        # preprocess the images using preprocess_input() from inception module
        x = preprocess_input(x)
        return x
    
    # Xử lý encode ảnh đầu vào.
    # imageI: ảnh PIL
    def handleEncodeImage(self, imageI):
        image = self.preprocess(imageI) # resize ảnh
        fea_vec = self.modelEncodeImage.predict(image) # Get the encoding vector for the image
        fea_vec = np.reshape(fea_vec, fea_vec.shape[1]) # reshape from (1, 2048) to (2048, )
        return fea_vec
    
    #Load Glove model
    def loadGloveModel(self):
        f = open(os.path.join('', './models/imagecaption/glove.6B.200d.txt'), encoding="utf-8")
        for line in f:
            values = line.split()
            word = values[0]
            coefs = np.asarray(values[1:], dtype='float32')
            self.embeddings_index[word] = coefs
        
        f.close()

    # Load từ điển
    def loadDictionary(self):
        file = open(os.path.join('', './models/imagecaption/Flickr_8k.trainImages.txt'), 'r')
        text = file.read()
        file.close()

        # Lấy dữ liệu
        dataset = list()
        for line in text.split('\n'):
            if len(line) < 1:
                continue
            identifier = line.split('.')[0]
            dataset.append(identifier)
        
        data = set(dataset)

        file = open(os.path.join('', './models/imagecaption/descriptions.txt'), 'r')
        detext = file.read()
        file.close()

        # Load từ điển
        descriptions = dict()
        for line in detext.split('\n'):
            tokens = line.split()
            image_id, image_desc = tokens[0], tokens[1:]
            if image_id in data:
                if image_id not in descriptions:
                    descriptions[image_id] = list()
                desc = 'startseq ' + ' '.join(image_desc) + ' endseq'
                descriptions[image_id].append(desc)

        all_train_captions = []
        for key, val in descriptions.items():
            for cap in val:
                all_train_captions.append(cap)

        word_counts = {}
        nsents = 0
        for sent in all_train_captions:
            nsents += 1
            for w in sent.split(' '):
                word_counts[w] = word_counts.get(w, 0) + 1

        vocab = word_counts

        ix = 1
        for w in vocab:
            self.wordtoix[w] = ix
            self.ixtoword[ix] = w
            ix += 1

        self.vocab_size = len(self.ixtoword) + 1 # Thêm 1 cho từ dùng để padding


    def handleInitGloveModel(self):
        self.embedding_matrix = np.zeros((self.vocab_size, self.embedding_dim))

        for word, i in self.wordtoix.items():
            embedding_vector = self.embeddings_index.get(word)
            if embedding_vector is not None:
                self.embedding_matrix[i] = embedding_vector


    # Với môi ảnh mới khi test, ta sẽ bắt đầu chuỗi với 'startseq' rồi sau đó cho vào model để dự đoán từ tiếp theo. Ta thêm từ
    # vừa được dự đoán vào chuỗi và tiếp tục cho đến khi gặp 'endseq' là kết thúc hoặc cho đến khi chuỗi dài 34 từ.
    def greedySearch(self, photo):
        in_text = 'startseq'
        for i in range(self.max_length):
            sequence = [self.wordtoix[w] for w in in_text.split() if w in self.wordtoix]
            sequence = pad_sequences([sequence], maxlen=self.max_length)
            yhat = self.modelPredictCaption.predict([photo,sequence], verbose=0)
            yhat = np.argmax(yhat)
            word = self.ixtoword[yhat]
            in_text += ' ' + word
            if word == 'endseq':
                break
        final = in_text.split()
        final = final[1:-1]
        final = ' '.join(final)
        return final


    
    