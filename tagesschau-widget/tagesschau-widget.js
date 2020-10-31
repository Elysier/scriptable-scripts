const tagesschauData = await new Request(
  'https://www.tagesschau.de/api2/homepage/'
).loadJSON();
const tagesschauHeader =
  'https://www.tagesschau.de/infoscreen/img/background-16-9-HD.png';
const widget = await createWidget();

if (!config.runsInWidget) {
  await widget.presentMedium();
} else {
  Script.setWidget(widget);
}

Script.complete();

/* Functions */

async function createWidget() {
  let w = new ListWidget();

  w.setPadding(15, 15, 15, 15);

  w.backgroundImage = await loadImage(tagesschauHeader);

  const logo = w.addImage(await loadImage('https://i.imgur.com/072c7Zl.png'));
  logo.leftAlignImage();
  logo.imageSize = new Size(100, 72);

  const title = tagesschauData.news[0].title;
  const ressort = tagesschauData.news[0].ressort;
  const date = new Date(tagesschauData.news[0].date);
  const dateString =
    date.toLocaleDateString() +
    ', ' +
    ('0' + date.getHours()).slice(-2) +
    ':' +
    ('0' + date.getMinutes()).slice(-2) +
    ' Uhr';
  const imageUrl = tagesschauData.news[0].teaserImage.videowebl.imageurl;

  w = await createArticle(w, title, ressort, dateString, imageUrl);

  w.url = tagesschauData.news[0].shareURL;

  return w;
}

async function createArticle(w, title, ressort, date, image) {
  const a = w.addStack();

  const aImage = a.addImage(await loadImage(image));
  aImage.cornerRadius = 5;

  a.addSpacer(10);

  const aInfo = a.addStack();
  aInfo.layoutVertically();

  const aRessort = aInfo.addText(
    ressort.charAt(0).toUpperCase() + ressort.slice(1)
  );
  aRessort.textColor = Color.orange();
  aRessort.font = Font.semiboldMonospacedSystemFont(12);

  const aTitle = aInfo.addText(title);
  aTitle.lineLimit = 4;
  aTitle.textColor = Color.white();
  aTitle.font = Font.headline();

  const aDate = aInfo.addText(date);
  aDate.textOpacity = 0.7;
  aDate.font = Font.semiboldMonospacedSystemFont(12);

  return w;
}

function createGradient(f, t) {
  let g = new LinearGradient();
  g.locations = [0, 1];
  g.colors = [new Color(f), new Color(t)];
  return g;
}

async function loadImage(url) {
  return await new Request(url).loadImage();
}
