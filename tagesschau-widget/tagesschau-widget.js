const tagesschauData = await new Request(
  'https://www.tagesschau.de/api2/homepage/'
).loadJSON();
const widget = await createWidget();

const ASSETS = {
  header: 'https://raw.githubusercontent.com/trbnhck/scriptable-scripts/main/tagesschau-widget/assets/tagesschau-bg.png',
  logo: 'https://github.com/trbnhck/scriptable-scripts/blob/main/tagesschau-widget/assets/tagesschau-logo_white.png?raw=true'
}

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

  w.backgroundImage = await loadImage(ASSETS.header);

  const tagesschauLogo = w.addImage(await loadImage(ASSETS.logo));
  tagesschauLogo.leftAlignImage();
  tagesschauLogo.imageSize = new Size(100, 72);

  const titleLabel = tagesschauData.news[0].title;
  const ressortLabel = tagesschauData.news[0].ressort;
  const date = new Date(tagesschauData.news[0].date);
  const dateLabel =
    date.toLocaleDateString() +
    ', ' +
    ('0' + date.getHours()).slice(-2) +
    ':' +
    ('0' + date.getMinutes()).slice(-2) +
    ' Uhr';
  const imageLabel = tagesschauData.news[0].teaserImage.videowebl.imageurl;

  w = await createArticle(w, titleLabel, ressortLabel, dateLabel, imageLabel);

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

async function loadImage(url) {
  return await new Request(url).loadImage();
}
