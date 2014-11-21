#!/usr/bin/python
##

import cv2
import threading


class Src():

    def __init__(self, type="MJPG", host="127.0.0.1", port="8080"):
        if type == "MJPG":
            self.SRC = "http://" + host + ":" + \
                port + "/?action=stream&dummy=mjpg"
        elif type == "UDP":
            self.SRC = "udp://@" + host + ":" + port
        elif type == "LOCAL":
            self.SRC = 0
        elif type == "HTTP":
            self.SRC = "http://" + host + ":" + port


video = Src("MJPG", "10.0.0.1", "8080")


class Tracker(threading.Thread):

    def __init__(self, src):
        threading.Thread.__init__(self)
        self.src = src
        self.cap = cv2.VideoCapture(self.src)
        if cap.isOpen():
            raise
        else:

    def start(self):
        pass

    def stop(self):
        pass

    def getSRC(self):
        return self.src

    def setSRC(self, newSrc):
        self.stop()
        self.src = newSrc
        self.cap = cv2.VideoCapture(self.src)
        self.start()


print(cap.isOpened())
while(True):
    ret, frame = cap.read()
    if not ret:
        print "Error grabbing frame"
        break
    cv2.imshow('frame', frame)
    if cv2.waitKey(1) == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()


print ("Hello world")

input()
