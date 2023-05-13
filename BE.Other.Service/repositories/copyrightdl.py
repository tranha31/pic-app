from .dlbase import DLBase

class CopyrightDL(DLBase):
    def __init__(self) -> None:
        super().__init__()

    def checkExistSign(self, lstSign):
        t = tuple(lstSign)
        query = ""
        if len(lstSign) == 1:
            query = "SELECT c.UserPublicKey FROM copyrightsignature c WHERE LOWER(c.UserPublicKey) = '%s' " % lstSign[0]
        else:
            query = "SELECT c.UserPublicKey FROM copyrightsignature c WHERE LOWER(c.UserPublicKey) IN {}".format(t)
            
        cursor = self.conn.cursor(dictionary=True)
        cursor.execute(query)
        records = cursor.fetchall()
        return records