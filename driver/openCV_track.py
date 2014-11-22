#!/usr/bin/python
##

import cv2
import threading


class Src():

    def __init__(self, filetype="MJPG", host="127.0.0.1", port="8080"):
        if filetype == "MJPG":
            self.SRC = "http://" + host + ":" + \
                port + "/?action=stream&dummy=mjpg"
        elif filetype == "UDP":
            self.SRC = "udp://@" + host + ":" + port
        elif filetype == "LOCAL":
            self.SRC = 0
        elif filetype == "HTTP":
            self.SRC = "http://" + host + ":" + port


video = Src("MJPG", "10.0.0.1", "8080")


class Tracker(threading.Thread):

    def __init__(self, src):
        threading.Thread.__init__(self)
        self.src = src
        self.cap = cv2.VideoCapture(self.src)
        if self.cap.isOpen():
            raise

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

        print(self.cap.isOpened())
        while(True):
            ret, frame = self.cap.read()
            if not ret:
                print "Error grabbing frame"
                break
            cv2.imshow('frame', frame)
            if cv2.waitKey(1) == ord('q'):
                break

        self.cap.release()
        cv2.destroyAllWindows()


print ("Hello world")

end = input()
