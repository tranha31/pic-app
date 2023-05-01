from math import sqrt, cos, pi, floor
import numpy as np
from PIL import Image as im
import io
import base64

class CopyrightBL:

    K = 5
    Y = 0
    Cb = 1
    Cr = 2
    oImageCaptionBL = None
    oImageSimilarBL = None
    oDL = None

    def __init__(self) -> None:
        pass
    
    """
    Kiểm tra ảnh có phải là ảnh đa mức xám không
    (24/4/2023)
    """
    def isGreyScale(self, img):
        img = img.convert('RGB')
        w, h = img.size
        for i in range(w):
            for j in range(h):
                r, g, b = img.getpixel((i,j))
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

        ycbcr = image.convert('YCbCr')

        YCbCr = list(ycbcr.getdata())  # flat list of tuples
        # reshape
        imYCbCr = np.reshape(YCbCr, (image.size[1], image.size[0], 3))
        # Convert 32-bit elements to 8-bit
        imYCbCr = imYCbCr.astype(np.uint8)
        return imYCbCr
    
    
    '''
    Tính giá trị C
    (11/4/2023)
    '''
    def C(self, u):
        if u == 0:
            return 1 / sqrt(2)
        else:
            return 1

    '''
    Chuyển ảnh từ miền không gian sang tần số
    A: ma trận điểm ảnh 8x8
    DCT: Ma trận điểm ảnh trong miền tần số
    (11/4/2023)
    '''
    def dct(self, A):
        DCT = np.zeros((8, 8))
        for u in range(8):
            for v in range(8):
                sum = 0
                for k in range(8):
                    for l in range(8):
                        sum = sum + A[k][l] * cos(pi * u * (2 * k + 1) / 16) * cos(pi * v * (2 * l + 1) / 16)
                sum = sum * self.C(u) * self.C(v) / 4
                DCT[u][v] = sum
        return DCT
    

    '''
    Chuyển kênh Y của ảnh từ miền không gian về miền tần số
    Chỉ convert 280 ô ảnh 8x8: do kích thước chữ ký là 40: 17*16 + 1*8
    (11/4/2023)
    '''
    def dctYchanel(self, YChanel):
        ldct = []
        for i in range(0, 129, 8):
            for j in range(0, 121, 8):
                MT = np.zeros((8, 8))
                for k in range(i, i + 8):
                    for l in range(j, j + 8):
                        MT[k % 8][l % 8] = YChanel[k][l]
                D = self.dct(MT)
                ldct.append(D)
        # Bổ sung thêm 8 ô tiếp theo cho đủ 280 ô
        m = 128
        for n in range(0, 57, 8):
            MT = np.zeros((8, 8))
            for k in range(n, n + 8):
                for l in range(m, m + 8):
                    MT[k % 8][l % 8] = YChanel[k][l]
            D = self.dct(MT)
            ldct.append(D)

        return ldct
    
    
    '''
    Lấy chữ ký trong ảnh
    (11/4/2023)
    '''
    def getSignInImage(self, base64_string):
        imYCbCr = self.inputImage(base64_string)
        if type(imYCbCr) == bool:
            return False
        
        signs = self.handleGetSignInImage(imYCbCr[:, :, self.Y])
        return signs

    '''
    Lấy text trong ảnh
    (11/4/2023)
    '''
    def getWatermarking(self, D):
        sign1 = ""
        for i in range(len(D)):
            x1 = D[i][5][2]
            x2 = D[i][4][3]
            if (x1 > x2):
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
    def handleGetSignInImage(self, YChanel):
        signs = []

        YChanelFlip = np.flip(YChanel, 1)

        L = self.dctYchanel(YChanel)
        sign1 = self.getWatermarking(L)

        L5 = self.dctYchanel(YChanelFlip)
        sign5 = self.getWatermarking(L5)

        YChanel2 = np.rot90(YChanel)
        YChanel2Flip = np.rot90(YChanelFlip)

        L2 = self.dctYchanel(YChanel2)
        sign2 = self.getWatermarking(L2)

        L6 = self.dctYchanel(YChanel2Flip)
        sign6 = self.getWatermarking(L6)
        
        YChanel3 = np.rot90(YChanel2)
        YChanel3Flip = np.rot90(YChanel2Flip)

        L3 = self.dctYchanel(YChanel3)
        sign3 = self.getWatermarking(L3)

        L7 = self.dctYchanel(YChanel3Flip)
        sign7 = self.getWatermarking(L7)
        
        YChanel4 = np.rot90(YChanel3)
        YChanel4Flip = np.rot90(YChanel3Flip)

        L4 = self.dctYchanel(YChanel4)
        sign4 = self.getWatermarking(L4)

        L8 = self.dctYchanel(YChanel4Flip)
        sign8 = self.getWatermarking(L8)
        
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
        
        return signs
    





    


