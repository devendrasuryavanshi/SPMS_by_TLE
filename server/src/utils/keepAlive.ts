import axios from "axios";

const keepAlive = (url: string) => {
  setInterval(async () => {
    try {
      await axios.get(url);
      console.log('Keep-alive ping sent');
    } catch (err) {
      console.log('Keep-alive ping failed');
    }
  }, 840000); // 14 minutes
};

export { keepAlive };