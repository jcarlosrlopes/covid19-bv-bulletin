import express from 'express';
import axios from 'axios';
import cheerio from 'cheerio';

const app = express();
app.use(express.json());

const url = 'https://www.boaviagem.ce.gov.br/relatorio.php?id=24&rel=#'; 

const fetchData = async (url) => {
  console.log("Crawling data...")
  let response = await axios(url).catch((err) => console.log(err));

  if(response.status !== 200){
    console.log("Error occurred while fetching data");
    return;
  }
  
  return response;
}

app.get("/", async (req, res) => {
  await fetchData(url).then( (response) => {
    const html = response.data;
    const $ = cheerio.load(html);

    let covidData = [];

    const statsTable = $('#boletim_epidemiologico > tbody > tr');
    statsTable.each(function() {
      let title = $(this).find('td');

      covidData.push({
        date: $(title[0]).text().trim(),
        suspect: $(title[1]).text().trim(),
        confirmed: $(title[2]).text().trim(),
        discarded: $(title[3]).text().trim(),
        deaths: $(title[4]).text().trim(),
        interned: $(title[5]).text().trim(),
        healed: $(title[6]).text().trim(),
        notified: $(title[7]).text().trim(),
        isolated: $(title[8]).text().trim(),
      })
    });

    covidData.pop();

    res.send(covidData);
  })
});

app.listen(3000);