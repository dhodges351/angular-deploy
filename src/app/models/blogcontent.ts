export class BlogContent {   
    constructor(){
      this._id = '';
      this.title = '';
      this.image = '';
      this.content = '';
      this.category = '';
      this.currentBlog = false;
      this.createdAt = '';
      this.imageList = new Array<string>();
      this.likes = 0;
      this.dislikes = 0;
    }
    public _id;
    public title;
    public image;
    public content;
    public category;
    public currentBlog;
    public createdAt;
    public imageList;
    public likes;
    public dislikes;
  }