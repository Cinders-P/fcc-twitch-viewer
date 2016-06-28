var streamerArr = ["Bacon_Donut", "Wyld", "PhantomL0rd", "Destiny", "Charliewinsmore", "okolnir", "LegendaryLea", "trumpsc", "nl_kripp", "pajlada", "wingsofdeath", "froggen", "mushisgosu", "TimTheTatman", "freecodecamp", "food", "bobross", "SiegeGames", "cryaotic", "bayleejae"];
var showWrapper = false;
var filter = {
    ALL: 0,
    ONLINE: 1,
    OFFLINE: 2
};
var filterMode = filter.ALL;
var timeoutID, prev, counter = 0;
var streamerBoxes = [];
var onlineStreams = "",
    offlineStreams = "",
    searchStreams = "";

$(function() {

    $.each(streamerArr, function(index) {
        $.getJSON("https://api.twitch.tv/kraken/streams/" + streamerArr[index], function(json) {
            if (json.stream) {
                streamerBoxes[index] = addOnline(json.stream.channel.status, json.stream.preview.medium, json.stream.channel.game, streamerArr[index]);
                onlineStreams = onlineStreams + streamerBoxes[index];
            } else {
                $.getJSON("https://api.twitch.tv/kraken/channels/" + streamerArr[index], function(j) {
                    streamerBoxes[index] = addOffline(j.logo, streamerArr[index]);
                    offlineStreams = offlineStreams + streamerBoxes[index];
                });
            }
        });
    });


    //chrome and safari
    $(window).bind('mousewheel', function(event) {
        if ((event.originalEvent.wheelDelta <= 0) && ($(window).scrollTop() + $(window).height() == $(document).height())) {
            wrapperUp();
        } else if ((event.originalEvent.wheelDelta >= 0) && (showWrapper === true) && ($(".wrapper").scrollTop() === 0)) {
            wrapperDown();
        }
    });

    //firefox
    $(window).bind('DOMMouseScroll', function(event) {
        if ((event.originalEvent.detail >= 0) && ($(window).scrollTop() + $(window).height() == $(document).height())) {
            wrapperUp();
        } else if ((event.originalEvent.detail <= 0) && (showWrapper === true) && ($(".wrapper").scrollTop() === 0)) {
            wrapperDown();
        }
    });
    $(".wrapper").dblclick(function() {
        if (showWrapper === false)
            wrapperUp();
        else {
            wrapperDown();
        }
    });
    $(".prompt").click(function() {
        if (showWrapper === false)
            wrapperUp();
        else
            wrapperDown();
    });

    $(".sidebar a").hide();


    if ($(window).width() <= 1220) {
        $(".big-stream-box").hide();
    }
    if ($(window).width() <= 490) {
        $(".wrapper").addClass("flex-wrap");
        $("button.filter").addClass("border-left");
    }
    $(window).on("resize", function() {
        if ($(window).width() <= 490) {
            $(".wrapper").addClass("flex-wrap");
            $("button.filter").addClass("border-left");
            $(".big-stream-box").hide();
        } else if ($(window).width() <= 1220) {
            $(".big-stream-box").hide();
            $(".wrapper").removeClass("flex-wrap");
            $("button.filter").removeClass("border-left");
        } else {
            $(".big-stream-box").show();
            $(".wrapper").removeClass("flex-wrap");
            $("button.filter").removeClass("border-left");
        }
    });
    $("button:first-of-type").click(function() {
        $("button.filter:nth-child(" + (filterMode + 1) + ")").removeClass("active");
        filterMode = filter.ALL;
        updateStreams();
        $("button.filter:nth-child(" + (filterMode + 1) + ")").addClass("active");
    });
    $("button:nth-of-type(2)").click(function() {
        $("button.filter:nth-child(" + (filterMode + 1) + ")").removeClass("active");
        filterMode = filter.ONLINE;
        updateStreams();
        $("button.filter:nth-child(" + (filterMode + 1) + ")").addClass("active");
    });
    $("button:nth-of-type(3)").click(function() {
        $("button.filter:nth-child(" + (filterMode + 1) + ")").removeClass("active");
        filterMode = filter.OFFLINE;
        updateStreams();
        $("button.filter:nth-child(" + (filterMode + 1) + ")").addClass("active");
    });

    $.getJSON("https://api.twitch.tv/kraken/streams/featured?limit=4&offset=0", function(feat) {
        $(".big-game-name").text(feat.featured[0].stream.channel.status);
        prev = feat.featured[0].stream.preview.template.replace("{width}", "900").replace("{height}", "506");
        $(".big-stream-box .preview-image").css("background-image", "url('" + prev + "')");
        $(".big-bold").text(feat.featured[0].stream.game);
        $(".big-stream-box a").attr("href", "http://twitch.tv/" + feat.featured[0].stream.channel.display_name);
        $(".big-streamer").text(feat.featured[0].stream.channel.display_name);

        for (var i = 1; i <= 3; i++) {
            $("#featured-col").prepend(addOnline(feat.featured[i].stream.channel.status, feat.featured[i].stream.preview.medium, feat.featured[i].stream.game, feat.featured[i].stream.channel.display_name));
        }
    });

    $("input").keyup(function() {
        $(".container-fluid .flex-wrap").empty();
        searchStreams = "";
        if (!$("input").val()) {
            updateStreams();
        } else {
            $.each(streamerArr, function(ind) {
                if (streamerArr[ind].toLowerCase().includes($("input").val().toLowerCase())) {
                    searchStreams = searchStreams.concat(streamerBoxes[ind]);
                }
            });
            $(".container-fluid .flex-wrap").html(searchStreams);
        }
    });

});

function addOnline(title, image, gName, sName) {
    return ('<div class="stream-box"><h4>' + title + '</h4><a href="http://twitch.tv/' + sName + '"><img class="preview-image" src="' + image + '"></a><div class="game-name"><h3 class="bold">' + gName + '</h3><h3 class="float-right">' + sName + '</h3></div></div>');
}

function wrapperUp() {
    $(".wrapper").css("height", "95vh");
    timeoutID = setTimeout(function() {
        $(".wrapper").removeClass("hide-scroll");
    }, 700);
    $(".prompt").text("scroll up for featured streams");
    $("body").addClass("hide-scroll");
    $(".sidebar a").fadeIn();
    if (!$("input").val())
        updateStreams();
    showWrapper = true;
}

function wrapperDown() {
    clearTimeout(timeoutID);
    $(".wrapper").addClass("hide-scroll").css("height", "5vh");
    setTimeout(function() {
        $(".wrapper").addClass("hide-scroll");
    }, 700);
    $(".prompt").text("scroll down for more streams");
    $("body").removeClass("hide-scroll");
    $(".sidebar a").fadeOut();
    showWrapper = false;
    event.preventDefault();
}

function addOffline(image, sName) {
    return ('<div class="profile-box flex-column flex-center"><a href="http://twitch.tv/' + sName + '"><img class="logo" src="' + image + '"></a><h3>' + sName + '</h3></div>');
}

function updateStreams() {
    if (filterMode === filter.ALL)
        $(".container-fluid .flex-wrap").html(onlineStreams).append(offlineStreams);
    else if (filterMode === filter.ONLINE)
        $(".container-fluid .flex-wrap").html(onlineStreams);
    else if (filterMode === filter.OFFLINE)
        $(".container-fluid .flex-wrap").html(offlineStreams);
    else {
        $(".container-fluid .flex-wrap").html("Sorry, there was an error.");
    }
    $("input").val("");
}
