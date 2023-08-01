from repository.dlcopyright import DLCopyright

class BLCopyright:

    oDL = None

    def __init__(self) -> None:
        self.oDL = DLCopyright()

    def checkExistSign(self, param):
        lstSign = param["lstSign"]
        return self.oDL.checkExistSign(lstSign)

    def getAllImage(self):
        data = self.oDL.getAllImage()
        if data != None and len(data) > 0:
            for item in data:
                item["CreatedDate"] = "{:%Y-%m-%d %H:%M:%S%z}".format(item["CreatedDate"])
                item["ModifiedDate"] = "{:%Y-%m-%d %H:%M:%S%z}".format(item["ModifiedDate"])

        return data

    def getImageContent(self, param):
        listID = param["listID"]
        return self.oDL.getImageContent(listID)

    def checkExistSignForCheck(self, param):
        lstSign = param["lstSign"]
        return self.oDL.checkExistSignForCheck(lstSign)
