tmj.controller('CardsController', function($rootScope, $location, $scope, $http, $sce, $compile, $routeParams) {

    $scope.ready = false;
    $scope.cards = [];
    $scope.cards_recommended = [];

    $scope.PAGE = 1;
    $scope.SIZE = 20;
    $scope.END = false;

    $http.defaults.headers.post["Content-Type"] = "application/x-www-form-urlencoded";

    $scope.count = 0;
    $scope.cardsFeatured = [];

    if (!isMobileDevice) {
        $('.cards.mobile').remove();
    } else {
        $http({
                method: 'get',
                url: API_URL + '/api/highlights.json',
            })
            .success(function(data) {
                data.highlights.forEach(function(f) {
                    $scope.cardsFeatured.push(f);
                });
            });
    }

    $scope.loadCards = function(p, slug, array, icon) {
        if (!slug) {
            slug = 'all'
        }
        if (!array) {
            array = $scope.cards;
        }
        if (!icon) {
            icon = 'posts';
        }
        if ($scope.PAGE > 1) {
            if (!isMobileDevice) {
                $('.cards').eq($scope.PAGE - 1).addClass('loading');
            }
        }
        $http({
                method: 'get',
                url: API_URL + '/api/' + slug + '/' + p + '/' + $scope.SIZE + '.json',
            })
            .success(function(data) {
                if (data.cards.length == 0) {
                    $scope.END = true;
                    if(!isMobileDevice){
                        $('.cards').removeClass('loading');
                    }
                } else {
                    if ($scope.PAGE == 1 && isMobileDevice && $rootScope.pageName != 'homePage') {
                        $scope.initialCard(array, icon, data.total ? data.total : 0);
                    }
                    if (data.highlight && !isMobileDevice) {
                        data.highlight.id = data.highlight.id * 999999;
                        array.push(data.highlight);
                    }
                    data.cards.forEach(function(card) {
                        array.push(card);
                    });
                    $scope.ready = true;
                    if (!isMobileDevice) {
                        setTimeout(function() {
                            if ($('.cards').data('masonry')) {
                                $('.cards').masonry('reloadItems');
                                $('.cards').masonry();
                            } else {
                                $('.cards').masonry({
                                    itemSelector: '.card',
                                    columnWidth: '.one-five',
                                    percentPosition: true,
                                    gutter: 0,
                                    transitionDuration: 0
                                });
                            }
                            $scope.lazyLoad(true);
                        }, 1000);
                    } else {
                        if ($('.cards').data('masonry')) {
                            $('.cards').masonry('destroy');
                        }
                        if ($scope.PAGE == 1) {
                            setTimeout(function() {
                                $('.cards').each(function(i, e) {
                                    $(e).css({ top: i * $(window).height() });
                                });
                            }, 500);
                        }
                    }
                    if ($scope.PAGE == 1) {
                        setTimeout(function() {
                            if ($('.initial-loading').is(':visible')) {
                                $('.initial-loading').hide();
                                $('.cards').addClass('show');
                            }
                            $('.cards').find('.card').addClass('show');
                        }, 1000);
                    } else {
                        setTimeout(function() {
                            $('.cards').removeClass('loading');
                            $('.cards').find('.card').addClass('show');
                        }, 1000);
                    }
                }
            });
    }
    $scope.loadCards($scope.PAGE, 'all', $scope.cards, 'posts');
    if (isMobileDevice) {
        $scope.loadCards($scope.PAGE, 'all', $scope.cards_recommended, 'recommendation');
    }

    $scope.lazyLoad = function(desktop) {
        if (desktop) {
            $(".card").not('.animated').each(function(i, e) {
                $(e).addClass('animate animated');
                setTimeout(function() {
                    $(e).removeClass('animate');
                }, 500)
            });

            $("div.img").not('.lazyloaded').each(function(i, e) {
                $(e).lazyload();
                $(e).addClass('lazyloaded');
                $(e).css({ "background-image": "url(" + $(this).data('original') + ")" });
            });
        } else {
            $("div.img").each(function(i, e) {
                $(this).css({ "background-image": "url(" + $(this).data('original') + ")" });
            });
        }
    }

    var running = false;
    $scope.swipeLeft = function($event) {
        if (!running) {
            running = true;
            var e = angular.element($event.target);
            e = $(e);
            if (!e.hasClass('container')) {
                e = $(e).closest('.container');
            }
            var page = $(e).data('page');
            var slug = $(e).data('slug');
            var walk = parseInt(e.css('left').replace('px')) - ($('.card').width() + 20);
            var size = e.find('.card').length;
            if (!e.hasClass('mobile')) {
                size = size - 1;
            }
            if (walk != -(size * ($('.card').width() + 20))) {
                $(e).animate({
                    left: walk
                }, 250, 'easeOutBack', function() {
                    console.log(running);
                    running = false;
                });
            } else {
                if (!e.hasClass('mobile')) {
                    page++;
                    $scope.PAGE++;
                    // temporary
                    slug = 'all';
                    if ($(e).data('slug') == 'posts') {
                        $scope.loadCards(page, slug, $scope.cards);
                    } else {
                        $scope.loadCards(page, slug, $scope.cards_recommended);
                    }

                    $(e).data('page', page);
                }
                if (walk != -((size + 1) * ($('.card').width() + 20))) {
                    $(e).animate({
                        left: walk
                    }, 250, 'easeOutBack', function() {
                        console.log(running);
                        running = false;
                    });
                }
            }
            $scope.lazyLoad(false);
        }
    }
    $scope.swipeRight = function($event) {
        var e = angular.element($event.target);
        e = $(e);
        if (!e.hasClass('container')) {
            e = $(e).closest('.container');
        }
        var walk = parseInt(e.css('left').replace('px')) + ($('.card').width() + 20);
        if (walk > 0) {
            walk = 0;
        }
        $(e).animate({
            left: walk
        }, 250, 'easeOutBack');
    }
    var distanceTop = 0;
    var cardPage = 1;
    $scope.swipeUp = function() {
        if (distanceTop == 0) {
            cardPage++;
        }
        if (cardPage == $('.cards').length) {
            $('.arrowBottom').fadeOut();
        }
        distanceTop = -$(window).height();
        $('.cards').each(function(i, e) {
            var top = parseInt($(this).css('top').replace('px'));
            if (i == 0 && top == (($('.cards').length - 1) * distanceTop)) {
                distanceTop = 0;
            }
            $(this).animate({ top: top + distanceTop });
        });
        $scope.lazyLoad(false);
    }
    $scope.swipeDown = function() {
        distanceTop = $(window).height();
        $('.arrowBottom').fadeIn();
        $('.cards').each(function(i, e) {
            var top = parseInt($(this).css('top').replace('px'));
            if (i == 0 && top == 0) {
                distanceTop = 0;
            }
            $(this).animate({ top: top + distanceTop });
        });
    }
    $scope.openCard = function($event, id, content) {
        var elem = angular.element($event.target);
        if (content.kind == "featured") {
            $location.path(content.source_url);
        } else if (!elem.hasClass('arrow') && !elem.hasClass('heart') && !elem.hasClass('originalPost') && !elem.hasClass('shareButton')) {
            $http({
                    method: 'get',
                    url: API_URL + '/api/cards/' + id + '.json',
                })
                .success(function(data) {
                    $rootScope.card = data;

                    if (isMobileDevice) {
                        var card = $(elem).closest('.card').clone();
                        card.css({
                            "position": "absolute",
                            "left": "50%",
                            "margin": 0,
                            "margin-left": card.width() / 2 * -1,
                            "top": 47,
                            "z-index": 999
                        });
                        var contentHTML = $compile(card.html())($scope);
                        card.html(contentHTML);
                        $('body').append(card);
                        card.animate({
                            left: 0,
                            top: 0,
                            margin: 0,
                            width: '100%',
                            height: '100%'
                        }, 200);


                        setTimeout(function() {
                            $('.card').last().find('.videoMobile').show(0);
                            $('.card').last().find('.heart').attr('src', '/img/like.png').width(24);
                            $('.card').last().find('.arrow').attr('src', '/img/share.png').width(24);
                            $('.card').last().find('.read-more').remove();
                            $('.card').last().addClass('openMobile');

                            if ($('.card').last().hasClass('text')) {
                                $('.card').last().find('.content').css({
                                    height: '100%',
                                    overflow: 'auto'
                                });
                                $('.card').last().find('.text').css({
                                    height: '85%',
                                    overflow: 'auto'
                                });
                            } else {
                                var h = $scope.imageHeightMobile();
                                $('.card').last().find('.img').animate({
                                    height: h
                                }, 300);
                                $('.card').last().find('.content').animate({
                                    height: 'auto'
                                }, 300);
                                $('.card').last().find('.text').css({
                                    height: 'auto',
                                    overflow: 'auto'
                                });
                            }

                            $('.card').last().find('.text').text(content.content);
                            $('.card').last().find('.share').css({
                                position: 'fixed',
                                bottom: 0,
                                width: '100%'
                            });
                            var close = $compile('<img class="close" ng-click="close($event)" src="/img/fechar.png" />')($scope);
                            $('.card').last().append(close);
                            $('.card').last().find('.close').css({
                                display: 'block'
                            });
                        }, 1);

                    } else {
                        if ($rootScope.card.content.length > 100 || $rootScope.card.kind == 'image' || $rootScope.card.kind == 'video') {
                            $('body').css({ overflow: "hidden" });
                            $location.path("/detalhe/card/" + $rootScope.card.id, false);
                            var lightbox = angular.element(document.querySelector('.lightbox'));
                            var lightboxDetail = angular.element(document.querySelector('.lightbox .detail'));

                            // lightbox.fadeIn();
                            lightbox.addClass('show');
                            lightboxDetail.addClass('show');
                        }
                    }
                });
        }
    }

    $scope.imageHeightMobile = function() {
        var w = $(window);
        var ratio;
        if ($rootScope.card.image) {
            ratio = $rootScope.card.image.height / $rootScope.card.image.width;
            return w.width() * ratio;
        }
    }

    if ($routeParams.id) {
        $scope.openCard({}, $routeParams.id, $rootScope.card);
    }

    $scope.close = function($event) {
        var elem = angular.element($event.target);
        var card = $(elem).closest('.card');
        card.fadeOut(300, function() {
            $(this).remove();
        })
        if (isMobileDevice) {
            $('.card').removeClass('openMobile');
        }
    }

    $scope.likeCard = function($event, id) {
        var elem = $(angular.element($event.target)).closest('.card');
        var heart = elem.find('.heart');
        if (!heart.parent().hasClass('liked')) {
            var count = parseInt(elem.find('.counter').text());
            $http({
                    method: 'POST',
                    url: API_URL + '/api/cards/' + id + '/like',
                    data: $.param({
                        id: id
                    })
                })
                .then(function(data) {
                    heart.attr('src', '/img/liked.png');
                    count++;
                    heart.parent().find('.counter').html('&nbsp;' + count);
                    heart.parent().addClass('liked');
                }, function(data) {
                    //remove that and parse error
                    heart.attr('src', '/img/liked.png');
                    count++;
                    heart.parent().find('.counter').html('&nbsp;' + count);
                    heart.parent().addClass('liked');
                });
        }
    }

    $scope.initialCard = function(array, filterType, total) {
        var cardContent;
        if (filterType == "posts") cardContent = "Posts";
        if (filterType == "recommendation") cardContent = "Recomendações";
        array.push({
            id: (parseInt(Math.random() * 999999) + 1),
            kind: 'initial',
            icon: {
                url: '/img/initial_' + filterType + '.svg'
            },
            count: total,
            content: cardContent
        });
    }

    $scope._throttleTimer = null;
    $scope._throttleDelay = 100;

    $scope.ScrollHandler = function(e) {
        clearTimeout($scope._throttleTimer);
        $scope._throttleTimer = setTimeout(function() {
            if ($(window).scrollTop() + $(window).height() > $(document).height() - 100) {
                $scope.PAGE++;
                if (!$scope.END) {
                    $scope.loadCards($scope.PAGE);
                }
            }
        }, $scope._throttleDelay);
    }

    $(document).ready(function() {
        $(window).off('scroll', $scope.ScrollHandler).on('scroll', $scope.ScrollHandler);
    });
});
