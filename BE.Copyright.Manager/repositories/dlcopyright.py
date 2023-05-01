from .dlbase import DLBase

class DLCopyright(DLBase):
    
    def __init__(self) -> None:
        super().__init__()

    def checkExistSign(self, lstSign):
        t = tuple(lstSign)
        query = ""
        if len(lstSign) == 1:
            query = "SELECT c.RefID FROM copyrightsignature c WHERE LOWER(c.UserPublicKey) = '%s' " % lstSign[0]
        else:
            query = "SELECT c.RefID FROM copyrightsignature c WHERE LOWER(c.UserPublicKey) IN {}".format(t)
            
        cursor = self.conn.cursor(dictionary=True)
        cursor.execute(query)
        records = cursor.fetchall()
        if len(records) > 0:
            return False
        else:
            return True
        
    def getAllImage(self):
        query= 'SELECT * FROM copyrightimage c'
        cursor = self.conn.cursor(dictionary=True)
        cursor.execute(query)
        records = cursor.fetchall()
        return records
    
    def getImageContent(self, listID):
        collection = self.dbMongo["CopyrightImage"]
        data = collection.find({"RefID" : {"$in" : listID}})

        imageContent = []
        imageID = []
        if data is not None:
            for image in data:
                content = image.get("ImageContent")
                content = content.replace("data:image/png;base64,", "")

                id = image.get("RefID")
                imageID.append(id)
                imageContent.append(content)

        result = {
            "contents": imageContent,
            "ids": imageID
        }

        return result