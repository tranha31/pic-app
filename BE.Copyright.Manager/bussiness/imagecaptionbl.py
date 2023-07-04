import numpy as np
from PIL import Image as im
import io
import base64
from models.imagecaption import ImageCaption
from models.captionsimilar import CaptionSimilar
from repositories.dlcopyright import DLCopyright

class ImageCaptionBL:

    oModel = None
    oDL = None
    oModelSimilar = None

    def __init__(self) -> None:
        self.oModel = ImageCaption()
        self.oModelSimilar = CaptionSimilar()
        self.oDL = DLCopyright()
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
        caption = self.oModel.generateCaption(image)
        return caption
    
    '''
    Lấy danh sách ảnh để check trùng
    (21/4/2023)
    '''
    def getListImageForCheck(self, caption):
        lstImage = self.oDL.getAllImage()

        lstCaption = [caption]
        lstResult = []
        if len(lstImage) == 0:
            return lstResult
        
        for image in lstImage:
            lstCaption.append(image["Caption"])

        similarValue = self.oModelSimilar.calculateSimilar(lstCaption)
        lstCaption = lstCaption[1:]
        similarValue = similarValue[0]
        
        
        for i in range(len(lstCaption)):
            if float(similarValue[i]) > 0.4:
                result = {
                    "ImageID": lstImage[i]["ImageID"],
                    "PublicKey": lstImage[i]["UserPublicKey"]
                }
                lstResult.append(result)
        
        return lstResult
