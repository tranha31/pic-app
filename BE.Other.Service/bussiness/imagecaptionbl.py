import numpy as np
from PIL import Image as im
import io
import base64
from models.imagecaption import ImageCaption

class ImageCaptionBL:

    oModel = None
    oDL = None
    oModelSimilar = None

    def __init__(self) -> None:
        self.oModel = ImageCaption()
        pass

    '''
    Convert từ chuỗi base64 string sang mảng điểm ảnh
    (11/4/2023)
    '''
    def inputImage(self, base64_string):
        imgdata = base64.b64decode(base64_string)
        image = im.open(io.BytesIO(imgdata))
        
        return image
    
    '''
    Sinh caption cho ảnh
    (19/4/2023)
    '''
    def createImageCaption(self, base64_string):
        image = self.inputImage(base64_string)
        encodeImage = self.oModel.handleEncodeImage(image)
        encodeImage = encodeImage.reshape((1,2048))
        caption = self.oModel.greedySearch(encodeImage)
        return caption
    
