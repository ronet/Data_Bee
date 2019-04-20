module.exports = app => {
  //1. 키워드 분리하기, 2. 세션 계속 유지하기
  const mongo = app.get("mongoose"),
    request = require("request"),
    cheerio = require("cheerio"),
    naver_header = require("../config/naver_header")("맥북+프로+15"),
    { WebClient } = require("@slack/client"),
    token = require("../config/slackbots.json").token,
    web = new WebClient(token);

  const content = [];
  setInterval(async () => {
    //크롤링 후 content에 입력
    await request(
      {
        url: naver_header.referer,
        headers: naver_header
      },
      (error, response, body) => {
        if (!error && response.statusCode == 200) {
          const $ = cheerio.load(body);

          $("#articleList li").each((i, e) => {
            const year = new Date().getUTCFullYear(),
              month = new Date().getUTCMonth(),
              date = new Date().getUTCDate(),
              hour = $(e)
                .children(".aside")
                .children("a")
                .children(".info")
                .children(".time")
                .text()
                .split(":")[0],
              minute = $(e)
                .children(".aside")
                .children("a")
                .children(".info")
                .children(".time")
                .text()
                .split(":")[1],
              tempTitle = $(e)
                .children("a")
                .children(".item")
                .children(".tit")
                .children("h3")
                .text(),
              tempHref = `https://cafe.naver.com/${$(e)
                .children("a")
                .attr("href")}`,
              tempDate = `${year}-${month}-${date} ${hour}:${minute}:00`;

            content[i] = {
              title: tempTitle,
              href: tempHref,
              date: tempDate
            };
          });
        }
      }
    );

    //content배열 element를 디비에서 검색, 없으면 저장 후 result에 저장
    const result = await Promise.all(content.map(async element => {
        const searchResult = await mongo.data.findOne({ href: element.href });
        if (!searchResult) {
          await mongo
            .data({
              title: element.title,
              href: element.href,
              date: element.date
            })
            .save();
          return `${element.date} : ${element.title} ${element.href}`;
        }
        return '';
    })).then(res => res.join('\n'));
//     for (const element of content) {
//       const searchResult = await mongo.data.findOne({ href: element.href });
//       if (!searchResult) {
//         mongo
//           .data({
//             title: element.title,
//             href: element.href,
//             date: element.date
//           })
//           .save();
//         result =
//           `${element.date} : ${element.title}
// ${element.href}
// ` + result;
//       }
//     }

    //result가 있으면 전송
    if (result) {
      await web.chat.postMessage({
        channel: "DH2REQUCR",
        text: result,
        username: "맥북 올라와쪄염"
      });
      result = "";
    }
  }, 10000);
};
