# initial imports
import pytube
import pyqrcode

link = 'https://www.youtube.com/watch?v=TWjvjZtg3Mg' # the video that our math teacher get angry at chalkboard
yt = pytube.YouTube(link)
yt.streams.first().download()

s = "https://farukbeygo.github.io/"

# Generate QR code
url = pyqrcode.create(s)

# Create and save the svg file naming "myqr.svg"
url.svg("myqr.svg", scale=8)