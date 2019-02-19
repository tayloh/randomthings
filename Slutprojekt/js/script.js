'use strict';

$(document).ready(function functionName() {
  var lives = 7;
  var rights = 0;
  var puzzle = 0;
  var init;
  var win = 46;
  var puzzledone = $(".1").hasClass("right") && $(".2").hasClass("right") && $(".3").hasClass("right") && $(".4").hasClass("right");

  $('.game li').on('click', function(){
    if($(this).hasClass("right")){
      $(this).addClass("green");
      rights++;
      console.log(rights);
    }else {
      if(!$(this).hasClass("red")){
          $(this).addClass("red");
          lives--;
          $("#hp").text(lives);
      }

    }

    if(rights == win){
      $(".game li").addClass("green");
    }

    if(!puzzledone && init && !($(this).hasClass("1") || $(this).hasClass("2") || $(this).hasClass("3") || $(this).hasClass("4"))){
      $(".1").addClass("red");
      $(".2").addClass("red");
      $(".3").addClass("red");
      $(".4").addClass("red");
      init = false;
    }
    if($(this).hasClass("1") || init){
      console.log(puzzle);
      init = true;
      switch (puzzle) {
        case 0: $(".2").addClass("right");
          puzzle = 1;
          console.log(puzzle);
          break;
        case 1: if($(".2").hasClass("green")) $(".3").addClass("right");
          console.log(puzzle);
          puzzle = 2;
          break;
        case 2: $(".4").addClass("right");
          console.log(puzzle);
          init = false;
          break;
        default: console.log("Default");
          break;

      }
    }

    if(lives == 0){
      $(".game li").addClass("red");
    }
  }); //game li on click functions end



}); //document end
