# Image CORS Checker
This project is a simple util that will validate all of the image url link, to check if those link is broke or not

## GitHub Action
> to be continued

## Description
This tool automates URL checking within a specified directory\
It'll report every broke url, either change to private(e.g. 403) or is blocked by same origin policy\
You can use it in CI check for your blog posts(as this is it's originally designed purpose)\
That way you don't have to manually check if one link is broke or not

The tool itself will return 1 if some of the urls is invalid, which means you can integrate with CI easily

## Environment Variables
Please fill in the following 2 environment variables
+ `CHECK_PATH`
    + You need to specify a directory, and the checker will go through every file within it, and check every matched urls
+ `FILE_FORMAT`
    + The default value is `jpg,jpeg,png,gif,webp`, you can specify more file extension to support your needs

## Run
```
$ npm i
$ node ./checker.js
```

## Author
+ [ambersun1234](https://github.com/ambersun1234)

## License
This project is licensed under GNU General Public License v3.0 License - see the [LICENSE](./LICENSE) file for detail