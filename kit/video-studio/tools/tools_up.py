import torch, torch.nn as nn, torch.nn.functional as F, numpy as np
from PIL import Image
class RDB(nn.Module):
    def __init__(s,nf=64,gc=32):
        super().__init__()
        s.conv1=nn.Conv2d(nf,gc,3,1,1); s.conv2=nn.Conv2d(nf+gc,gc,3,1,1); s.conv3=nn.Conv2d(nf+2*gc,gc,3,1,1); s.conv4=nn.Conv2d(nf+3*gc,gc,3,1,1); s.conv5=nn.Conv2d(nf+4*gc,nf,3,1,1); s.l=nn.LeakyReLU(0.2,True)
    def forward(s,x):
        x1=s.l(s.conv1(x)); x2=s.l(s.conv2(torch.cat((x,x1),1))); x3=s.l(s.conv3(torch.cat((x,x1,x2),1))); x4=s.l(s.conv4(torch.cat((x,x1,x2,x3),1)))
        return s.conv5(torch.cat((x,x1,x2,x3,x4),1))*0.2+x
class RRDB(nn.Module):
    def __init__(s): super().__init__(); s.rdb1=RDB(); s.rdb2=RDB(); s.rdb3=RDB()
    def forward(s,x): return s.rdb3(s.rdb2(s.rdb1(x)))*0.2+x
class Net(nn.Module):
    def __init__(s,nb=23):
        super().__init__(); s.conv_first=nn.Conv2d(3,64,3,1,1); s.body=nn.Sequential(*[RRDB() for _ in range(nb)]); s.conv_body=nn.Conv2d(64,64,3,1,1)
        s.conv_up1=nn.Conv2d(64,64,3,1,1); s.conv_up2=nn.Conv2d(64,64,3,1,1); s.conv_hr=nn.Conv2d(64,64,3,1,1); s.conv_last=nn.Conv2d(64,3,3,1,1); s.l=nn.LeakyReLU(0.2,True)
    def forward(s,x):
        f=s.conv_first(x); f=f+s.conv_body(s.body(f))
        f=s.l(s.conv_up1(F.interpolate(f,scale_factor=2,mode='nearest'))); f=s.l(s.conv_up2(F.interpolate(f,scale_factor=2,mode='nearest')))
        return s.conv_last(s.l(s.conv_hr(f)))
sd=torch.load('models/RealESRGAN_x4plus.pth',map_location='cpu'); sd=sd.get('params_ema',sd.get('params',sd))
m=Net(); m.load_state_dict(sd); m.eval(); torch.set_num_threads(4)
im=Image.open('ref/storyboard.jpg').convert('RGB')
xs=[(0,379),(386,764),(772,1149),(1156,1536)]; ys=[(0,338),(346,664),(672,1024)]
k=0
for (y0,y1) in ys:
  for (x0,x1) in xs:
    k+=1; t=im.crop((x0+2,y0+2,x1-2,y1-2)); t.save(f'tiles/p{k:02d}.png')
    x=torch.from_numpy(np.asarray(t).copy()).permute(2,0,1)[None].float()/255
    with torch.no_grad(): y=m(x).clamp(0,1)
    Image.fromarray((y[0].permute(1,2,0).numpy()*255).round().astype(np.uint8)).save(f'up/p{k:02d}.png'); print(k, tuple(y.shape), flush=True)
