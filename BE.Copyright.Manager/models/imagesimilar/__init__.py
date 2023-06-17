import base64
import io
import numpy as np
from sentence_transformers import SentenceTransformer, util
from PIL import Image
import cv2

class ImageSimilar:

    oModel = None
    oSift = None
    threshold1 = 0.81
    threshold2 = 0.87
    w_distance = 0.8
    w_similar = 0.9

    def __init__(self) -> None:
        self.oModel = SentenceTransformer('clip-ViT-B-32')
        self.oSift = cv2.SIFT_create()
        pass

    """
    Xử lý kiểm tra tương đồng
    (26/4/2023)
    """
    def process(self, imageTest, lstImageSimilar, lstIDSimilar):
        lstSimilar = []
        lstResult = []

        imageCheck = [imageTest]
        for img in lstImageSimilar:
            imageCheck.append(img)

        result = self.checkSimilar(self.threshold1, imageCheck)
        
        if type(result) != bool:
            lstSimilar = [image for image in result if image[0] >= self.threshold2]

            for similar in lstSimilar:
                lstResult.append(lstIDSimilar[similar[2] - 1])

            lstSimilarTemp = [image for image in result if image[0] < self.threshold2]
            
            image1 = self.convertImageOpenCV(imageTest)
            
            for temp in lstSimilarTemp:
                idImage = lstIDSimilar[temp[2] - 1]
                imgTemp = lstImageSimilar[temp[2] - 1]
                image2 = self.convertImageOpenCV(imgTemp)

                check = self.checkSimilarSift(image1, image2)

                if check:
                    lstResult.append(idImage)

            if len(lstResult) != 0:
                lstResult = [*set(lstResult)]
        return lstResult
    

    """
    Kiểm tra tương đồng bằng clip-vit-b32
    (26/4/2023)
    """
    def checkSimilar(self, threshold, images):
        #print(len(images))
        encoded_image = self.oModel.encode(images, batch_size=128, convert_to_tensor=True, show_progress_bar=True)
        processed_images = util.paraphrase_mining_embeddings(encoded_image)

        #print(processed_images)
        result = []

        for image in processed_images:
            if image[1] == 0 or image[2] == 0:
                result.append(image)

        #print(result)
        near_duplicates = [image for image in result if image[0] >= threshold]
        print(near_duplicates)
        if len(near_duplicates) == 0:
            return False
        else:
            return near_duplicates
        
    """
    Kiểm tra tương đồng bằng sift
    (26/4/2023)
    """
    def checkSimilarSift(self, image1, image2):
        kp_1, desc_1 = self.oSift.detectAndCompute(image1, None)
        kp_2, desc_2 = self.oSift.detectAndCompute(image2, None)

        if (desc_1 is None) or (desc_2 is None):
            return False

        FLANN_INDEX_KDTREE = 0
        index_params = dict(algorithm = FLANN_INDEX_KDTREE, trees = 5)
        search_params = dict()

        try:
            flann = cv2.FlannBasedMatcher(index_params,search_params)
            matches = flann.knnMatch(desc_1, desc_2, k=2)
            good_points = []

            for m, n in matches:
                if m.distance < self.w_distance * (n.distance):
                    good_points.append(m)

            number_keypoints = 0
            if len(kp_1) <= len(kp_2):
                number_keypoints = len(kp_1)
            else:
                number_keypoints = len(kp_2)

            if len(good_points) / number_keypoints >= self.w_similar:
                return True
            else:
                return False
            
        except:
            return False
        
        
    def readImage(self, base64_string):
        imgdata = base64.b64decode(base64_string)
        return Image.open(io.BytesIO(imgdata))
    
    def convertImageOpenCV(self, image):
        return cv2.cvtColor(np.array(image), cv2.COLOR_BGR2GRAY)