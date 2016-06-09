module.exports = {
    getRatingtoRank : function(contestants, rank){
      var left = 1;
      var right = 8000;
      while(right-left>1){
          var mid = (left+right)/2;
          //console.log("Mid = "+mid);
          if(elo_rating.getSeed(contestants,mid) < rank) {
            right = mid;
            //console.log("Right = "+right);
          }
          else {
            left = mid;
            //console.log("Left = "+left);
          }
      }
      return left;
    },
    getSeed : function(contestants, rating){
      var extracontestant = {
          party : 0,
          name : 'dummy',
          rank : 0,
          points : 0,
          rating : rating
      }
      var result = 0;
      for(var i=0;i<contestants.length;i++){
          var Ra = contestants[i].rating;
          var Rb = extracontestant.rating;
          var e = 1.00 / (parseFloat(1) + Math.pow(10,(parseFloat(Rb - Ra)) / 400.00 ));
          //console.log("Ra : "+contestants[i].rating+", Rb : "+extracontestant.rating+", e : "+e);
          result += e;
      }
      //console.log('Result of sum = '+result);
      return result;
    },
    process : function(contestant){
      for(var i=0;i<contestant.length;i++){
          contestant[i].seed = 1;
          for(var j=0;j<contestant.length;j++){
              if(i==j) continue;
              else {
                  var Ra = contestant[i].rating;
                  var Rb = contestant[j].rating;
                  var e = 1.00 / (parseFloat(1) + Math.pow(10,(parseFloat(Rb - Ra)) / 400.00 ));
                  contestant[i].seed += e;
              }
          }
      }
      for(var i=0;i<contestant.length;i++){
          var midRank = Math.sqrt(contestant[i].rank * contestant[i].seed);
          contestant[i].needRating = elo_rating.getRatingtoRank(contestant,midRank);
          contestant[i].delta = (contestant[i].needRating - contestant[i].rating) / 2;
      }
      contestant.sort(function(a, b) {
              return b.rating - a.rating;
      });
      var sum = 0;
      for(var i=0;i<contestant.length;i++){
          sum+=contestant[i].delta;
      }
      var inc = (-1*sum) / (contestant.length - 1);
      for(var i=0;i<contestant.length;i++){
          contestant[i].delta += inc;
      }
      var sum = 0;
      var zeroSumCount = Math.min(4 * Math.round(Math.sqrt(contestant.length)),contestant.length);
      for(var i=0;i<zeroSumCount;i++){
          sum += contestant[i].delta;
      }
      var inc = Math.min( Math.max( (-1 * sum) / zeroSumCount , -10) , 0);
      for(var i=0;i<contestant.length;i++){
          contestant[i].delta += inc;
      }
      return contestant;
    }
};
