from ulti.callhttprequest import CallHttpRequest

class TestBL:
    
    http = CallHttpRequest()
    
    def __init__(self) -> None:
        pass

    def getAllImage(self):
        url = "copyright/images"
        result = self.http.CallHTTPGet(url, {})

        return result
    
    def checkExistSign(self, data):
        url = "copyright/check/exist"
        datas = {
            "lstSign" : data
        }
        result = self.http.CallHTTPPost(url, datas)

        return result