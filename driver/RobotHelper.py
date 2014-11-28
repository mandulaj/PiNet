# Helper functions for the PiNet

def getDirection(cmd):
    "get the angle direction from the command"
    if cmd == "F":
        return 0
    elif cmd == "R":
        return 90
    elif cmd == "L":
        return -90
    elif cmd == "B":
        return 180
    elif cmd == "FL":
        return -45
    elif cmd == "FR":
        return 45
    elif cmd == "BL":
        return -135
    elif cmd == "BR":
        return 135
    else:
        return None

def isPositive(num):
    "test if num is positive"
    return abs(num) == num
