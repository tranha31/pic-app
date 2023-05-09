from math import sqrt, cos, pi, floor
import cv2
import numpy as np
from PIL import Image as im
import io
import base64
from .imagecaptionbl import ImageCaptionBL
from .imagesimilarbl import ImageSimilarBL
from repositories.dlcopyright import DLCopyright

class CopyrightBL:

    K = 5
    Y = 0
    Cb = 1
    Cr = 2
    oImageCaptionBL = None
    oImageSimilarBL = None
    oDL = None

    def __init__(self) -> None:
        self.oImageCaptionBL = ImageCaptionBL()
        self.oImageSimilarBL = ImageSimilarBL()
        self.oDL = DLCopyright()
        pass
    
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

    '''
    Xử lý nhúng chữ ký lên ảnh
    (11/4/2023)
    '''
    def embedWatermarking(self, base64_string, sign):
        if len(sign) != 40:
            return "Sign invalid"
        
        imRGB = self.inputImage(base64_string)

        if type(imRGB) == bool:
            return "Image cannot be greyscale"
        
        # Minsize = (144 x 144)
        if imRGB.shape[0] < 144 or imRGB.shape[1] < 144:
            return "Image is not size enough"
        
        R, G, B = cv2.split(imRGB)
        s = self.hexToBinary(sign)
        if(self.handleValidateImage(R)):
            caption = self.oImageCaptionBL.createImageCaption(base64_string)
            check = self.checkImageSimilar(base64_string, caption)

            if type(check) == bool and check:
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
                return result
            
            else:
                result = {
                    "data" : check,
                    "error": "Image has similar"
                }

                return result
            
        else:
            return "Image was had sign"
            
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

        image.paste(mark, shape, mark)

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
    Xử lý kiểm tra ảnh
    TODO: Chưa có check bằng ML
    (11/4/2023)
    '''    
    def handleValidateImage(self, R):
        RChannel = np.copy(R)
        lstSign = []

        #Kiểm tra góc trên bên trái
        sign_block = self.getSignBlock(RChannel)
        sign = self.checkWatermarking(sign_block) 
        if(type(sign) == str):
            lstSign.append(sign)
        
        #Kiểm tra góc trên bên phải
        RChannel2 = np.rot90(RChannel)
        sign_block = self.getSignBlock(RChannel2)
        sign = self.checkWatermarking(sign_block) 
        if(type(sign) == str):
            lstSign.append(sign)

        #Kiểm tra góc dưới bên phải
        RChannel3 = np.rot90(RChannel2)
        sign_block = self.getSignBlock(RChannel3)
        sign = self.checkWatermarking(sign_block)
        if(type(sign) == str):
            lstSign.append(sign)
        
        #Kiểm tra góc dưới bên trái
        RChannel4 = np.rot90(RChannel3)
        sign_block = self.getSignBlock(RChannel4)
        sign = self.checkWatermarking(sign_block)
        if(type(sign) == str):
            lstSign.append(sign)

        #Kiểm cho trường hợp đảo ngược ảnh
        #Kiểm tra góc trên trái
        RChannel_1 = np.copy(R)
        RChannelFlip = np.flip(RChannel_1, 1)
        sign_block = self.getSignBlock(RChannelFlip)
        sign = self.checkWatermarking(sign_block)
        if(type(sign) == str):
            lstSign.append(sign)

        #Kiểm tra góc trên phải
        RChannelFlip2 = np.rot90(RChannelFlip)
        sign_block = self.getSignBlock(RChannelFlip2)
        sign = self.checkWatermarking(sign_block)
        if(type(sign) == str):
            lstSign.append(sign)

        #Kiểm tra góc dưới phải
        RChannelFlip3 = np.rot90(RChannelFlip2)
        sign_block = self.getSignBlock(RChannelFlip3)
        sign = self.checkWatermarking(sign_block)
        if(type(sign) == str):
            lstSign.append(sign)
        
        #Kiểm tra góc dưới trái
        RChannelFlip4 = np.rot90(RChannelFlip3)
        sign_block = self.getSignBlock(RChannelFlip4)
        sign = self.checkWatermarking(sign_block)
        if(type(sign) == str):
            lstSign.append(sign)
        

        if(len(lstSign) == 0):
            return True
        else:
            return self.oDL.checkExistSign(lstSign)
    
    '''
    Kiểm tra trong ảnh đã có chữ ký hay chưa
    (11/4/2023)
    '''
    def checkWatermarking(self, sign_block):
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
                return True
            else:
                sign2 += chr(digit[i])

        return sign2.lower()

    '''
    Kiểm tra độ tương đồng về ảnh
    (22/4/2023)
    '''
    def checkImageSimilar(self, base64string, caption):
        lstImageID = self.oImageCaptionBL.getListImageForCheck(caption)

        lstID = []
        if len(lstImageID) == 0:
            return True

        for image in lstImageID:
            lstID.append(image["ImageID"])
        
        result = self.oImageSimilarBL.handleCheckSimilar(lstID, base64string)
        if len(result) == 0:
            return True
        else:
            return result






    


