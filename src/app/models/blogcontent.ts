export class BlogContent {   
    constructor(){
      this.id = '';
      this.title = '';
      this.image = '';
      this.content = '';
      this.category = '';
      this.currentBlog = false;
      this.createdAt = '';
      this.imageList = new Array<string>();
    }
    public id;
    public title;
    public image;
    public content;
    public category;
    public currentBlog;
    public createdAt;
    public imageList;
  }