const express = require("express");
const app = express();
const axios = require("axios");
const bodyParser = require("body-parser");
const url = "https://api.telegram.org/bot";
const snapsave  = require("snapsave-downloader2")
require('dotenv').config();


const port = 80;

app.use(bodyParser.json());

app.post("/", async (req, res) => {
  const chatId = req.body.message.chat.id;
  const sentMessage = req.body.message.text;

  if(!isValidUrl(sentMessage) || sentMessage.startsWith('/')) {
    axios
    .post(`${url}${process.env.API_TOKEN}/sendMessage`, { chat_id: chatId, text: "URL isn't valid" })
    .then(() => {
        res.status(200).send('Invalid URL');
    })

  } else {
    console.log(`${req.body.message.from.first_name} wants to download the following video ${sentMessage}`);

    const videoLink = await snapsave(sentMessage);
  
    axios
      .post(`${url}${process.env.API_TOKEN}/sendVideo`, { chat_id: chatId, video: videoLink.data[0].url })
      .then((response) => {
        res.status(200).send(response);
      })
      .catch((error) => {
        res.status(200).send(error);
      });
  }
});

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});


const isValidUrl = urlString=> {
    var urlPattern = new RegExp('^(https?:\\/\\/)?'+ // validate protocol
  '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // validate domain name
  '((\\d{1,3}\\.){3}\\d{1,3}))'+ // validate OR ip (v4) address
  '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // validate port and path
  '(\\?[;&a-z\\d%_.~+=-]*)?'+ // validate query string
  '(\\#[-a-z\\d_]*)?$','i'); // validate fragment locator
return !!urlPattern.test(urlString);
}