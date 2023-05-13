from math import sqrt, cos, pi, floor
import cv2
import numpy as np
from PIL import Image as im
import io
import base64
from .imagecaptionbl import ImageCaptionBL
from repositories.copyrightdl import CopyrightDL

class CopyrightBL:

    K = 5
    Y = 0
    Cb = 1
    Cr = 2
    oImageCaptionBL = None
    oDL = None

    def __init__(self) -> None:
        self.oImageCaptionBL = ImageCaptionBL()
        pass

    '''
    Convert string sang bit. 1 chữ => 7 bit
    (11/4/2023)
    '''
    def hexToBinary(self, string):
        binary = ''
        for x in string:
            bit = format(ord(x), 'b')
            if len(bit) < 7:
                padding = 7 - len(bit)
                for i in range(padding):
                    bit = "0" + bit
            binary = binary + bit
        return binary
    
    """
    Kiểm tra ảnh có phải là ảnh đa mức xám không
    (24/4/2023)
    """
    def isGreyScale(self, img):
        img_temp = img
        img_temp = img_temp.convert('RGB')
        w, h = img_temp.size
        for i in range(w):
            for j in range(h):
                r, g, b = img_temp.getpixel((i,j))
                if r != g != b: 
                    return False
        return True

    '''
    Convert từ chuỗi base64 string sang mảng điểm ảnh
    (11/4/2023)
    '''
    def inputImage(self, base64_string):
        imgdata = base64.b64decode(base64_string)
        image = im.open(io.BytesIO(imgdata))

        checkGrey = self.isGreyScale(image)
        if checkGrey:
            return False

        imageRGB = cv2.cvtColor(np.array(image), cv2.COLOR_RGB2BGR)
        
        return imageRGB
    

    def getSignBlock(self, RChannel):
        block = []
        for i in range(0, 129, 8):
            for j in range(0, 121, 8):
                block.append(RChannel[i:i+8, j:j+8])
        # Bổ sung thêm 8 ô tiếp theo cho đủ 280 ô
        m = 128
        for n in range(0, 57, 8):
            block.append(RChannel[n:n+8, m:m+8])

        return block
    
    def mergeImage(self, RChannel, L):
        temp = 0
        for i in range(0, 129, 8):
            for j in range(0, 121, 8):
                RChannel[i:i+8, j:j+8] = L[temp]
                temp = temp + 1
        # Bổ sung thêm 8 ô tiếp theo cho đủ 280 ô
        m = 128
        for n in range(0, 57, 8):
            RChannel[n:n+8, m:m+8] = L[temp]
            temp = temp + 1

    def embedWatermarking(self, base64_string, sign):
        result = None
        try:
            imRGB = self.inputImage(base64_string)
            s = self.hexToBinary(sign)
            R, G, B = cv2.split(imRGB)
            caption = self.oImageCaptionBL.createImageCaption(base64_string)
            sign_block = self.getSignBlock(R)
            self.watermarking(sign_block, s)
            self.mergeImage(R, sign_block)
            imageResult = self.outImage(R, G, B)
            imgdata = base64.b64decode(base64_string)
            image = im.open(io.BytesIO(imgdata))
            imageView = self.markConfirmIntoImage(image)

            result = {
                "caption" : caption,
                "image" : imageResult,
                "imageMark": imageView,
                "error": ""
                
            }
        except:
            print("An exception occurred")
        
        return result
    
    '''
    Đóng dấu đã xác nhận lên ảnh để view trên ui
    (20/4/2023)
    '''
    def markConfirmIntoImage(self, image):
        mark = im.open('check_mark (1).png', 'r')
        mark = mark.convert("RGBA")

        width = image.size[1]

        shape = (20, 20)
        if(20 > width / 30):
            shape = (int(width / 20), int(width / 20))

        mark = mark.resize(shape)

        image.paste(mark, (20, 20), mark)

        buffer = io.BytesIO()
        image.save(buffer, format="PNG")
        buffer.seek(0)
        myimage = buffer.getvalue()
        t = base64.b64encode(myimage)
        t = str(t)
        t = t[2:]
        t = t[:-1]
        r = "data:image/png;base64," + t

        return r
    
    '''
    Nhúng chữ ký lên ảnh
    Thuật toán Digital watermarking
    Luôn lấy điểm (5,2) và (4,3) để nhúng
    (11/4/2023)
    '''
    def watermarking(self, sign_block, sign):
        tmp = 0
        for i in range(len(sign_block)):
            D = sign_block[i]
            if sign[tmp] == '1':
                D[5][2] = 200
            else:
                D[5][2] = 100

            tmp = tmp + 1

    '''
    Convert byte to image
    Return base64 string
    (11/4/2023)
    '''
    def outImage(self, R, G, B):
        out_img = cv2.merge([R, G, B])

        _, im_arr = cv2.imencode('.png', out_img) 
        im_bytes = im_arr.tobytes()
        im_b64 = base64.b64encode(im_bytes)
        im_b64 = str(im_b64)
        im_b64 = im_b64[2:]
        im_b64 = im_b64[:-1]
        r = "data:image/png;base64," + im_b64
        return r

    '''
    Lấy chữ ký trong ảnh
    (11/4/2023)
    '''
    def getSignInImage(self, base64_string):
        imgRGB = self.inputImage(base64_string)
        if type(imgRGB) == bool:
            return False
        
        R, G, B = cv2.split(imgRGB)
        
        signs = self.handleGetSignInImage(R)
        return signs

    '''
    Lấy text trong ảnh
    (11/4/2023)
    '''
    def getWatermarking(self, sign_block):
        sign1 = ""
        for i in range(len(sign_block)):
            D = sign_block[i]
            if D[5][2] == 200:
                sign1 += "1"
            elif D[5][2] == 100:
                sign1 += "0"
            else:
                sign1 += "1"

        digit = []
        sign2 = ""
        for i in range(len(sign1) // 7):
            digit.append(int(sign1[i * 7:i * 7 + 7], 2))

        for i in range(len(digit)):
            if(not(digit[i] >= 48 and digit[i] <= 57) and 
               not(digit[i] >= 65 and digit[i] <= 90) and 
               not(digit[i] >= 97 and digit[i] <= 122)):
                return None
            else:
                sign2 += chr(digit[i])
        
        #TODO: Gọi DB để kiểm tra xem đã có chữ ký sign2 hay chưa. Tạm cứ trả về sign2

        return sign2.lower()

    '''
    Xử lý lấy chữ ký trong ảnh
    Kiểm tra ở 4 góc + 2 chiều xuôi và ngược
    (11/4/2023)
    '''
    def handleGetSignInImage(self, R):
        signs = []
        RChannel = np.copy(R)
        RChannel_1 = np.copy(R)

        RChannelFlip = np.flip(RChannel_1, 1)

        sign_block = self.getSignBlock(RChannel)
        sign1 = self.getWatermarking(sign_block)

        sign_block = self.getSignBlock(RChannelFlip)
        sign5 = self.getWatermarking(sign_block)

        RChannel2 = np.rot90(RChannel)
        RChannelFlip2 = np.rot90(RChannelFlip)

        sign_block = self.getSignBlock(RChannel2)
        sign2 = self.getWatermarking(sign_block)

        sign_block = self.getSignBlock(RChannelFlip2)
        sign6 = self.getWatermarking(sign_block)
        
        RChannel3 = np.rot90(RChannel2)
        RChannelFlip3 = np.rot90(RChannelFlip2)

        sign_block = self.getSignBlock(RChannel3)
        sign3 = self.getWatermarking(sign_block)

        sign_block = self.getSignBlock(RChannelFlip3)
        sign7 = self.getWatermarking(sign_block)
        
        RChannel4 = np.rot90(RChannel3)
        RChannelFlip4 = np.rot90(RChannelFlip3)

        sign_block = self.getSignBlock(RChannel4)
        sign4 = self.getWatermarking(sign_block)

        sign_block = self.getSignBlock(RChannelFlip4)
        sign8 = self.getWatermarking(sign_block)
        
        if(sign1 != None):
            signs.append(sign1)

        if(sign2 != None):
            signs.append(sign2)
        
        if(sign3 != None):
            signs.append(sign3)

        if(sign4 != None):
            signs.append(sign4)

        if(sign5 != None):
            signs.append(sign5)

        if(sign6 != None):
            signs.append(sign6)

        if(sign7 != None):
            signs.append(sign7)

        if(sign8 != None):
            signs.append(sign8)
        
        oDL = CopyrightDL()
        if(len(signs) == 0):
            return signs
        else:
            lstSign = oDL.checkExistSign(signs)
            signs = []
            for i in range(len(lstSign)):
                signs.append(lstSign[i]["UserPublicKey"])

            return signs
    





    


