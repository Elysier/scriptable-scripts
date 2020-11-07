// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-blue; icon-glyph: newspaper;

// name: tagesschau-widget.js
// description: A scriptable widget which displays the latest tagesschau.de article 📰
// author: Torben Haack
// email: haack@hey.com

let tagesschauData;
try {
  tagesschauData = await new Request(
    'https://www.tagesschau.de/api2/homepage/'
  ).loadJSON();
} catch (e) {
  const errorWidget = createErrorWidget();

  if (!config.runsInWidget) {
    await errorWidget.presentMedium();
  } else {
    Script.setWidget(errorWidget);
  }
  Script.complete();
}
const widget = await createWidget();

if (!config.runsInWidget) {
  await widget.presentMedium();
} else {
  Script.setWidget(widget);
}
Script.complete();

async function createWidget() {
  let listWidget = new ListWidget();

  listWidget.setPadding(15, 15, 15, 15);

  listWidget.backgroundImage = await loadImage(
    'http://www.tagesschau.de/infoscreen/img/background-16-9-HD.png'
  );

  listWidget = await createHeaderImage(listWidget);

  listWidget.addSpacer(10);

  listWidget = await createArticle(listWidget, tagesschauData.news[0]);

  return listWidget;
}

async function createArticle(listWidget, data) {
  const { title, shareURL } = data;
  const date = new Date(data.date);
  let image;
  if(data.images[0].videowebs.imageurl) {
    image = data.images[0].videowebs.imageurl;
  } else if(data.teaserImage.videowebl.imageurl) {
    image = data.teaserImage.videowebl.imageurl;
  } else {
    image = 'http://www.tagesschau.de/infoscreen/img/background-16-9-HD.png';
  }
  let { ressort } = data;

  if (ressort == undefined) {
    ressort = 'Sonstiges';
  }

  listWidget.url = shareURL;

  listWidget.addSpacer(20);

  const article = listWidget.addStack();

  const articleImage = article.addImage(await loadImage(image));
  articleImage.cornerRadius = 5;

  article.addSpacer(10);

  const articleInfo = article.addStack();
  articleInfo.layoutVertically();

  const articleRessort = articleInfo.addText(
    ressort.charAt(0).toUpperCase() + ressort.slice(1)
  );
  articleRessort.textColor = Color.orange();
  articleRessort.font = Font.semiboldMonospacedSystemFont(12);

  const articleTitle = articleInfo.addText(title.replaceAll('+', '').trim());
  articleTitle.textColor = Color.white();
  articleTitle.font = Font.headline();
  articleTitle.minimumScaleFactor = 0.5;

  const articleDate = articleInfo.addText(formatDate(date));
  articleDate.font = Font.semiboldMonospacedSystemFont(12);
  articleDate.textOpacity = 0.7;
  articleDate.textColor = Color.white()

  listWidget.addSpacer(10);

  return listWidget;
}

async function createHeaderImage(listWidget) {
  const headerImage = listWidget.addImage(
    await loadImage(
      'https://www.ard.de/image/461284/16x9/4788513279306625340/320'
    )
  );
  headerImage.imageSize = new Size(100, 5);
  headerImage.tintColor = Color.white();
  headerImage.centerAlignImage();
  headerImage.applyFillingContentMode();

  return listWidget;
}

function createErrorWidget() {
  const errorWidget = new ListWidget();

  const bgGradient = new LinearGradient();
  bgGradient.locations = [0, 1];
  bgGradient.colors = [new Color('#2D65AE'), new Color('#19274C')];

  errorWidget.backgroundGradient = bgGradient;

  const title = errorWidget.addText('tagesschau');
  title.font = Font.headline();
  title.centerAlignText();

  errorWidget.addSpacer(10);

  const errorText = errorWidget.addText(
    'Es besteht keine Verbindung zum Internet.'
  );
  errorText.font = Font.semiboldMonospacedSystemFont(16);
  errorText.textColor = Color.red();

  const errorText2 = errorWidget.addText(
    'Dieses Widget benötigt eine Verbindung zum Internet um funktionieren zu können.'
  );
  errorText2.font = Font.regularRoundedSystemFont(14);
  errorText2.textColor = Color.red();
  errorText2.textOpacity = 0.6;

  return errorWidget;
}

async function loadImage(url) {
  return await new Request(url).loadImage();
}

function formatDate(dateObject) {
  return `${leadingZero(dateObject.getDate())}.${leadingZero(
    dateObject.getMonth() + 1
  )}.${dateObject.getFullYear()}, ${leadingZero(
    dateObject.getHours()
  )}:${leadingZero(dateObject.getMinutes())} Uhr`;
}

function leadingZero(input) {
  return ('0' + input).slice(-2);
}
