"use strict";

//импортируем те пакеты, которые нам понадобятся в сборке
const gulp = require("gulp");
const webpack = require("webpack-stream");
const browsersync = require("browser-sync");

//путь, куда мы будем все это компилировать
const dist = "./dist/";

//служит для того, чтобы отслеживать изменения, которые мы вносим в html файл
gulp.task("copy-html", () => {
    //берем html файл
    return gulp.src("./src/index.html")
                //перемещаем в папку dist
                .pipe(gulp.dest(dist))
                //запускаем чтобы страница перезагрузилась
                .pipe(browsersync.stream());
});

//таск по компиляции скриптов
gulp.task("build-js", () => {
    return gulp.src("./src/js/main.js")
                .pipe(webpack({
                    //компиляция в режиме разработки
                    mode: 'development',
                    //режим output, то есть куда это все будет складываться
                    output: {
                        filename: 'script.js'
                    },
                    //отключаем, за слежение отвечает что-то другое
                    watch: false,
                    //создает карту проекта. То есть из каких кусочков у нас состоят скрипты 
                    devtool: "source-map",
                    module: {
                        rules: [
                          {
                            test: /\.m?js$/,
                            exclude: /(node_modules|bower_components)/,
                            use: {
                              //использование babel
                              loader: 'babel-loader',
                              options: {
                                presets: [['@babel/preset-env', {
                                    //тут включаем дебаг. Если возникнут проблемы то консоль покажет где ошибка
                                    debug: true,
                                    //библиотека которая позволяет подключать полифилы. Код написанный в старом стандарте
                                    corejs: 3,
                                    //говорим что когда наш проект компилируется эта библиотека анализирует наш код и смотрит на браузерлист который мы поддерживаем и подключает те полифилы которые нам нужны
                                    useBuiltIns: "usage"
                                }]]
                              }
                            }
                          }
                        ]
                      }
                }))
                //после компиляции мы берем файл который получился и отправляем в dist
                .pipe(gulp.dest(dist))
                //и перезагружаем нашу страницу
                .on("end", browsersync.reload);
});

//копирует файлы из любых файлов из любых папок
gulp.task("copy-assets", () => {
  //берем любые файлы из любых папок
    return gulp.src("./src/assets/**/*.*")
                //перемещаем в дист
                .pipe(gulp.dest(dist + "/assets"))
                //и перезагружаем
                .on("end", browsersync.reload);
});

//запускается отдельный сервер
gulp.task("watch", () => {
    //работает при помощи browsersync
    browsersync.init({
    //серверит файлы в папке dist
    server: "./dist/",
    //просто порт запуска
		port: 4000,
		notify: true
    });
    
    //так же запускаем чтобы галп следил за изменениями отдельных файлов 
    gulp.watch("./src/index.html", gulp.parallel("copy-html"));
    //то же самое с assets
    gulp.watch("./src/assets/**/*.*", gulp.parallel("copy-assets"));
    //и со всеми js файлами
    gulp.watch("./src/js/**/*.js", gulp.parallel("build-js"));
});

//нам понадобится таск билд который параллельно запускает все эти задачи
gulp.task("build", gulp.parallel("copy-html", "copy-assets", "build-js"));

gulp.task("build-prod-js", () => {
    return gulp.src("./src/js/main.js")
                .pipe(webpack({
                    mode: 'production',
                    output: {
                        filename: 'script.js'
                    },
                    module: {
                        rules: [
                          {
                            test: /\.m?js$/,
                            exclude: /(node_modules|bower_components)/,
                            use: {
                              loader: 'babel-loader',
                              options: {
                                presets: [['@babel/preset-env', {
                                    corejs: 3,
                                    useBuiltIns: "usage"
                                }]]
                              }
                            }
                          }
                        ]
                      }
                }))
                .pipe(gulp.dest(dist));
});

//таск дефол. Это то что запускается по умолчанию
gulp.task("default", gulp.parallel("watch", "build"));