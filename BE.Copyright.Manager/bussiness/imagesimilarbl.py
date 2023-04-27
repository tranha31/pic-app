from models.imagesimilar import ImageSimilar
from repositories.dlcopyright import DLCopyright

class ImageSimilarBL:

    oModel = None
    oDL = None

    def __init__(self) -> None:
        self.oModel = ImageSimilar()
        self.oDL = DLCopyright()

        pass

    def handleCheckSimilar(self, listID, base64_string):
        print(listID)

        imageSim = self.getImageSimilar(listID)
        imageTest = self.oModel.readImage(base64_string)
        
        result = self.oModel.process(imageTest, imageSim["imageSimilar"], imageSim["ids"])
        return result

    def getImageSimilar(self, listID):
        images = self.oDL.getImageContent(listID)
        
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
        