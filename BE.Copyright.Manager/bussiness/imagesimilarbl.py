from models.imagesimilar import ImageSimilar
from ulti.callhttprequest import CallHttpRequest

class ImageSimilarBL:

    oModel = None
    http = CallHttpRequest()

    def __init__(self) -> None:
        self.oModel = ImageSimilar()

        pass

    def handleCheckSimilar(self, listID, base64_string):
        imageSim = self.getImageSimilar(listID)
        imageTest = self.oModel.readImage(base64_string)
        
        result = self.oModel.process(imageTest, imageSim["imageSimilar"], imageSim["ids"])
        return result

    def getImageSimilar(self, listID):
        url = "copyright/image/content"
        datas = {
            "listID" : listID
        }
        resultRequest = self.http.CallHTTPPost(url, datas)
        images = resultRequest["data"]
        
        lstImages = images["contents"]
        lstImageID = images["ids"]

        listImageSimilar = []

        for image in lstImages:
            img = self.oModel.readImage(image)
            listImageSimilar.append(img)

        result = {
            "imageSimilar": listImageSimilar,
            "ids": lstImageID
        } 

        return result
        