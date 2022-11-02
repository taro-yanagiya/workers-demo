export const MessageType = {
  Client: {
    JOIN: 0x01,
    CURSOR: 0x02,
    DOWN: 0x03,
    DRAG: 0x04,
    UP: 0x05,
    ERROR: 0xff,
  },
  Server: {
    READY: 0x01,
    JOINED: 0x02,
    MEMBER: 0x03,
    CURSOR: 0x04,
    DOWN: 0x05,
    DRAG: 0x06,
    UP: 0x07,
    OBJ: 0x08,
    OBJ_MOVE: 0x09,
    QUIT: 0x0a,
    ERROR: 0xff,
  },
};
