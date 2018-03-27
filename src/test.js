const L = require("./lambda-calculus.js");

var term = `
$0 #s #z z
$1 #s #z /s z
$2 #s #z /s /s z
$3 #s #z /s /s /s z
$4 #s #z /s /s /s /s z
$5 #s #z /s /s /s /s /s z
$6 #s #z /s /s /s /s /s /s z
$7 #s #z /s /s /s /s /s /s /s z
$8 #s #z /s /s /s /s /s /s /s /s z
$9 #s #z /s /s /s /s /s /s /s /s /s z
$10 #s #z /s /s /s /s /s /s /s /s /s /s z
$11 #s #z /s /s /s /s /s /s /s /s /s /s /s z
$12 #s #z /s /s /s /s /s /s /s /s /s /s /s /s z
$13 #s #z /s /s /s /s /s /s /s /s /s /s /s /s /s z
$14 #s #z /s /s /s /s /s /s /s /s /s /s /s /s /s /s z
$15 #s #z /s /s /s /s /s /s /s /s /s /s /s /s /s /s /s z
$16 #s #z /s /s /s /s /s /s /s /s /s /s /s /s /s /s /s /s z
$17 #s #z /s /s /s /s /s /s /s /s /s /s /s /s /s /s /s /s /s z
$18 #s #z /s /s /s /s /s /s /s /s /s /s /s /s /s /s /s /s /s /s z
$19 #s #z /s /s /s /s /s /s /s /s /s /s /s /s /s /s /s /s /s /s /s z
$20 #s #z /s /s /s /s /s /s /s /s /s /s /s /s /s /s /s /s /s /s /s /s z
$21 #s #z /s /s /s /s /s /s /s /s /s /s /s /s /s /s /s /s /s /s /s /s /s z
$22 #s #z /s /s /s /s /s /s /s /s /s /s /s /s /s /s /s /s /s /s /s /s /s /s z
$23 #s #z /s /s /s /s /s /s /s /s /s /s /s /s /s /s /s /s /s /s /s /s /s /s /s z
$24 #s #z /s /s /s /s /s /s /s /s /s /s /s /s /s /s /s /s /s /s /s /s /s /s /s /s z
$25 #s #z /s /s /s /s /s /s /s /s /s /s /s /s /s /s /s /s /s /s /s /s /s /s /s /s /s z
$26 #s #z /s /s /s /s /s /s /s /s /s /s /s /s /s /s /s /s /s /s /s /s /s /s /s /s /s /s z
$27 #s #z /s /s /s /s /s /s /s /s /s /s /s /s /s /s /s /s /s /s /s /s /s /s /s /s /s /s /s z
$28 #s #z /s /s /s /s /s /s /s /s /s /s /s /s /s /s /s /s /s /s /s /s /s /s /s /s /s /s /s /s z
$29 #s #z /s /s /s /s /s /s /s /s /s /s /s /s /s /s /s /s /s /s /s /s /s /s /s /s /s /s /s /s /s z
$30 #s #z /s /s /s /s /s /s /s /s /s /s /s /s /s /s /s /s /s /s /s /s /s /s /s /s /s /s /s /s /s /s z
$31 #s #z /s /s /s /s /s /s /s /s /s /s /s /s /s /s /s /s /s /s /s /s /s /s /s /s /s /s /s /s /s /s /s z
$32 #s #z /s /s /s /s /s /s /s /s /s /s /s /s /s /s /s /s /s /s /s /s /s /s /s /s /s /s /s /s /s /s /s /s z
$suc #n #s #z /s //n s z
$add #a #b #s #z //a s //b s z
$mul #a #b #s #z //a /b s z
$exp #a #b /b a
$Y #f /#x /f /x x #x /f /x x
$I #o #i i
$O #o #i o
$nil #con #nil nil
$con #x #xs #con #nil //con x xs
$B+ /Y #r #x #a #b //x b #x /a /r x
$B0 /Y #r #a #b /a r
$B1 /B+ B0
$B2 /B+ B1
$B3 /B+ B2
$B4 /B+ B3
$B5 /B+ B4
$B6 /B+ B5
$B7 /B+ B6
$B8 /B+ B7
$B9 /B+ B8
$BO #bs #o #i /o bs
$BI #bs #o #i /i bs
$Bpeek #n #x
  ///n
    #t /t #x //x
      #x #r #t //t x #a #b #c ///r a b /a c
      #x #r #t //t x #a #b #c ///r a b /b c
    #t //t x #a #b #c c
    #x #r r
$Badder /Y #R #c #x #y
  $case_c_O
    #x
    $case_x_O_xs
      #xs
      #y
      $case_y_O_ys
        #ys
        #xs
        #R
        /BO ///R O xs ys
      $case_y_I_ys
        #ys
        #xs
        #R
        /BI ///R O xs ys
      ///y case_y_O_ys case_y_I_ys xs
    $case_x_I_xs
      #xs
      #y
      $case_y_O_ys
        #ys
        #xs
        #R
        /BI ///R O xs ys
      $case_y_I_ys
        #ys
        #xs
        #R
        /BO ///R I xs ys
      ///y case_y_O_ys case_y_I_ys xs
    //x case_x_O_xs case_x_I_xs
  $case_c_I
    #x
    $case_x_O_xs
      #xs
      #y
      $case_y_O_ys
        #ys
        #xs
        #R
        /BI ///R O xs ys
      $case_y_I_ys
        #ys
        #xs
        #R
        /BO ///R O xs ys
      ///y case_y_O_ys case_y_I_ys xs
    $case_x_I_xs
      #xs
      #y
      $case_y_O_ys
        #ys
        #xs
        #R
        /BO ///R I xs ys
      $case_y_I_ys
        #ys
        #xs
        #R
        /BI ///R I xs ys
      ///y case_y_O_ys case_y_I_ys xs
    //x case_x_O_xs case_x_I_xs
  /////c case_c_O case_c_I x y R


$BX /BI /BO /BI /BI /BO /BO /BI /BI /BI B0

//Bpeek 16 ///Badder O BX BX
`;


console.log(L.reduce(term, 1));
