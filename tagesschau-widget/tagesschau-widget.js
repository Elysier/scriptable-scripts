// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-blue; icon-glyph: newspaper;

// name: tagesschau-widget.js
// description: A scriptable widget which displays the latest tagesschau.de article 📰
// author: Torben Haack
// email: haack@hey.com

//#region Configuration
const Configuration = {
  default: {
    size: 'medium', // small, medium, large
    style: 'default', // default, old (required size: medium)
  },
};
//#endregion

//#region Classes
class Configurator {
  constructor() {
    this.config = {};
    if (args.widgetParameter) {
      args.widgetParameter.split(',').forEach((item) => {
        if(item.split(':')[1] == undefined) return;
        this.config[item.split(':')[0].trim()] = item.split(':')[1].trim();
      });
    } else {
      this.config = Configuration.default;
    }
  }
  get(key) {
    return this.config[key];
  }
  getAll() {
    return this.config;
  }
}
class Utilities {
  async loadImage(url) {
    return await new Request(url).loadImage();
  }
  valSize(small, medium, large) {
    switch (configurator.get('size')) {
      case 'small':
        return small;
      case 'medium':
        return medium;
      case 'large':
        return large;
      default:
        return medium;
    }
  }
}
class Tagesschau {
  constructor() {
    this.feedUrl = 'https://www.tagesschau.de/xml/rss2_https/';
  }

  async parseFeed(count = 1) {
    const feed = await new Request(this.feedUrl).loadString();

    const container = await new WebView();
    await container.loadHTML(
      feed.replaceAll('<link>', '<goto>').replaceAll('</link>', '</goto>')
    );

    const channelQuery = `document.getElementsByTagName('channel')[0]`;

    let items = [];
    for (let i = 0; i < count; i++) {
      const itemQuery = `${channelQuery}.getElementsByTagName('item')[${i}]`;

      const date = await container.evaluateJavaScript(
        `${itemQuery}.getElementsByTagName('pubdate')[0].innerHTML`
      );
      const title = await container.evaluateJavaScript(
        `${itemQuery}.getElementsByTagName('title')[0].innerHTML`
      );
      const link = await container.evaluateJavaScript(
        `${itemQuery}.getElementsByTagName('goto')[0].innerHTML`
      );

      const pageContent = await new Request(link).loadString();
      const image = pageContent
        .match(
          /<meta [^>]*property=[\"']og:image[\"'] [^>]*content=[\"']([^'^\"]+?)[\"'][^>]*>/g
        )[0]
        .replace('<meta property="og:image" content="', '')
        .replace('"/>', '')
        .replace('" />', '');

      items[i] = {
        date,
        title,
        link,
        image,
      };
    }

    return {
      items,
    };
  }
}
class ComponentCreator {
  createTitleStyle(title, size = 16) {
    title.font = Font.semiboldMonospacedSystemFont(size);
    title.leftAlignText();
    title.minimumScaleFactor = 0.8;
    title.textColor = Color.white();
    return title;
  }
  createTagesschauLogo(widget) {
    const tagesschauLogoStack = widget.addStack();
    tagesschauLogoStack.setPadding(5, 0, 10, 15);

    const tagesschauLogo = tagesschauLogoStack.addImage(
      fileManager.readImage(`${appDir}app.png`)
    );
    tagesschauLogo.imageOpacity = 0.7;
    tagesschauLogo.imageSize = new Size(25, 25);
    
    return widget;
  }
  createDate(widget, date){
    const dateFormatter = new DateFormatter();
    dateFormatter.useShortTimeStyle();
    const pubDate = widget.addText(
      dateFormatter.string(new Date(date)) + ' Uhr'
    );
    pubDate.font = Font.regularMonospacedSystemFont(12);
    pubDate.leftAlignText();
    pubDate.textColor = Color.orange();
    
    return widget;
  }
  async createArticleStack(widget, item){
    let articleStack = widget.addStack();
    
    let articleImage = articleStack.addImage(await utilities.loadImage(item.image))
    articleImage.imageSize = new Size(100,50)
    articleImage.cornerRadius = 10
    
    let articleInfo = articleStack.addStack()
    articleInfo.layoutVertically()
    
    articleInfo = this.createDate(articleInfo, item.date)
    
    let title = articleInfo.addText(item.title)
    title = this.createTitleStyle(title);
    
    articleStack.url = item.link
    
    return widget;
  }
  
  async createSmallWidget(widget, feed) {

    widget.setPadding(0, 0, 0, 0);
    widget.backgroundImage = await utilities.loadImage(
      feed.items[0].image
    );

    let darkOverlay = widget.addStack();
    darkOverlay.size = new Size(169, 169);
    darkOverlay.backgroundColor = new Color('#000', 0.6);
    darkOverlay.layoutVertically();
    darkOverlay.centerAlignContent();
    darkOverlay.setPadding(15, 15, 15, 15);

    darkOverlay = this.createTagesschauLogo(darkOverlay)

    darkOverlay.addSpacer();

    darkOverlay = this.createDate(darkOverlay, feed.items[0].date)

    let title = darkOverlay.addText(feed.items[0].title);
    title = this.createTitleStyle(title);
    
    widget.url = feed.items[0].link;

    return widget;
  }
  
  async createMediumWidget(widget, feed) {
    if(configurator.get('style') == 'old') {
          widget.backgroundImage = fileManager.readImage(`${appDir}bg.png`);
      
      let newsStack = widget.addStack();
      newsStack.layoutVertically();
      newsStack.setPadding(3.3, 0, 0, 0);
      newsStack.centerAlignContent()
      
      const logo = newsStack.addImage(fileManager.readImage(`${appDir}logo.png`));
      logo.tintColor = Color.white();
      logo.imageSize = new Size(100, 45)
      logo.centerAlignImage()
      logo.applyFillingContentMode();
      
      newsStack = await this.createArticleStack(newsStack, feed.items[0])
      newsStack.addSpacer(10)
      newsStack = await this.createArticleStack(newsStack, feed.items[1])
      
      newsStack.addSpacer(20)
      
      return widget;
      
    }
  
      widget.setPadding(0, 0, 0, 0);
      widget.backgroundImage = await utilities.loadImage(
        feed.items[0].image
      );
  
      let darkOverlay = widget.addStack();
      darkOverlay.size = new Size(360, 169);
      darkOverlay.backgroundColor = new Color('#000', 0.6);
      darkOverlay.layoutVertically();
      darkOverlay.centerAlignContent();
      darkOverlay.setPadding(15, 25, 15, 25);
  
      darkOverlay = this.createTagesschauLogo(darkOverlay)
  
      darkOverlay.addSpacer();
  
      darkOverlay = this.createDate(darkOverlay, feed.items[0].date)
  
      let title = darkOverlay.addText(feed.items[0].title);
      title = this.createTitleStyle(title, 26);
      
      widget.url = feed.items[0].link;
      
      return widget;
  }
  
  async createLargeWidget(widget, feed) {
      widget.backgroundImage = fileManager.readImage(`${appDir}bg.png`);
      
      let newsStack = widget.addStack();
      newsStack.backgroundColor = new Color('#000', 0.5);
      newsStack.size = new Size(360,380);
      newsStack.setPadding(0, 25, 0, 5)
      newsStack.layoutVertically();
      newsStack.centerAlignContent()
      
      newsStack.addSpacer()
      
      newsStack = await this.createArticleStack(newsStack, feed.items[0])
      newsStack.addSpacer(10)
      newsStack = await this.createArticleStack(newsStack, feed.items[1])
      newsStack.addSpacer(10)
      newsStack = await this.createArticleStack(newsStack, feed.items[2])
      newsStack.addSpacer(10)
      newsStack = await this.createArticleStack(newsStack, feed.items[3])
      newsStack.addSpacer(10)
      newsStack = await this.createArticleStack(newsStack, feed.items[4])
      
      newsStack.addSpacer()
      
      return widget;
  }
}
class WidgetCreator {
  async createWidget() {
    let widget = new ListWidget();

    this.feed = await new Tagesschau().parseFeed(utilities.valSize(1, 2, 5));

    if (configurator.get('size') == 'small') {
      widget = await componentCreator.createSmallWidget(widget, this.feed);
    } else if(configurator.get('size') == 'medium') {
      widget = await componentCreator.createMediumWidget(widget, this.feed);
    } else if(configurator.get('size') == 'large') {
      widget = await componentCreator.createLargeWidget(widget, this.feed);
    } else {
      widget = await componentCreator.createMediumWidget(widget, this.feed);
    }

    return widget;
  }
}
//#endregion

//#region Script
const fileManager = FileManager.local();
const configurator = new Configurator();
const componentCreator = new ComponentCreator();
const widgetCreator = new WidgetCreator();
const utilities = new Utilities();

const appDir = `${fileManager.documentsDirectory()}/tagesschau-widget/`;
if(!fileManager.fileExists(appDir)) {
  fileManager.createDirectory(appDir)
}
if(!fileManager.fileExists(`${appDir}app.png`)) {
  fileManager.writeImage(`${appDir}app.png`, await utilities.loadImage('https://images-eu.ssl-images-amazon.com/images/I/610N7OMj0rL.png'));
}
if(!fileManager.fileExists(`${appDir}bg.png`)) {
  fileManager.writeImage(`${appDir}bg.png`, await utilities.loadImage('http://www.tagesschau.de/infoscreen/img/background-16-9-HD.png'));
}
if(!fileManager.fileExists(`${appDir}logo.png`)){
  fileManager.writeImage(`${appDir}logo.png`, await utilities.loadImage('https://www.ard.de/image/461284/16x9/4788513279306625340/320'));
}
const widget = await widgetCreator.createWidget();

if(!config.runsInWidget) {
  switch(configurator.get('size')) {
    case 'small':
      widget.presentSmall();
      break;
    case 'medium':
      widget.presentMedium();
      break;
    case 'large':
      widget.presentLarge();
      break;
    default:
      widget.presentMedium();
      break;
  }
}

Script.setWidget(widget);
Script.complete();
//#endregion
