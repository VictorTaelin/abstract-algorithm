const L = require("./lambda-calculus.js");

var term = `
@U #f
  /f f

@Y #f
  /#x /f /x x #x /f /x x

@F.id
  #x x

@F.flip #f #a #b
  //f b a

@F.K #a #b
  b

@C.suc #n #s #z
  /s //n s z

@C.add #a #b #s #z
  //a s //b s z

@C.mul #a #b #s #z
  //a /b s z

@C.exp #a #b
  /b a

@C.0
  #s #z z

@C.1
  /C.suc C.0

@C.2
  /C.suc C.1

@C.3
  /C.suc C.2

@C.4
  /C.suc C.3

@C.5
  /C.suc C.4

@C.6
  /C.suc C.5

@C.7
  /C.suc C.6

@C.8
  /C.suc C.7

@C.9
  /C.suc C.8

@C.16
  //C.mul C.8 C.2

@C.32
  //C.mul C.16 C.2

@C.64
  //C.mul C.32 C.2

@C.128
  //C.mul C.64 C.2

@C.256
  //C.mul C.128 C.2

@C.512
  //C.mul C.256 C.2

@C.double
  /C.mul C.2

@L.nil #con #nil
  nil

@L.con #x #xs #con #nil
  //con x xs

@P.new #a #b
  #new //new a b

@P.fst #p
  /p #a #b a

@P.snd #p
  /p #a #b b

@T.new #a #b #c
  #new ///new a b c

@T.fst #t
  /t #a #b #c a

@T.snd #t
  /t #a #b #c b

@T.trd #t
  /t #a #b #c c

@B.suc /Y #r #x #a #b
  //x b #x /a /r x

@B.0 /Y #r #a #b
  /a r

@B.O #bs #o #i
  /o bs

@B.I #bs #o #i
  /i bs

@B.peek #n #x
  ///n
    #t /t #x //x
      #x #r #t //t x #a #b #c ///r a b /a c
      #x #r #t //t x #a #b #c ///r a b /b c
    #t //t x #a #b #c c
    #x #r r

@B.add /Y #R #xxs #yys
  ///xxs
    #xs #t //t F.id  xs
    #xs #t //t B.suc xs
    #f #xs ///yys
      #ys #t //t F.id  ys
      #ys #t //t B.suc ys
      #g #ys /f /g /B.O //R xs ys

@B.mul #xxs
  / #f /Y #R #yys
    ///yys
      #ys #R    /B.O /R ys
      #ys #R /f /B.O /R ys
      R
    /B.add xxs

@B.fromC #c
  //c B.suc B.0

@B.1
  /B.suc B.0

@B.2
  /B.suc B.1

@B.3
  /B.suc B.2

@B.4
  /B.suc B.3

@B.5
  /B.suc B.4

@B.6
  /B.suc B.5

@B.7
  /B.suc B.6

@B.8
  /B.suc B.7

@B.9
  /B.suc B.8

@B.27
  /B.I /B.I /B.I /B.O /B.I B.0

@B.137
  /B.I /B.O /B.O /B.I /B.O /B.O /B.O /B.I B.0

@B.rnd32.a
  /B.I /B.O /B.I /B.O /B.I /B.I /B.I /B.O
  /B.O /B.O /B.O /B.O /B.O /B.O /B.I /B.O
  /B.I /B.O /B.O /B.O /B.I /B.O /B.I /B.O
  /B.O /B.O /B.O /B.O /B.I /B.I /B.I /B.I
  /B.I /B.I /B.O /B.I /B.O /B.I /B.I /B.O
  /B.O /B.I /B.I /B.I /B.O /B.I /B.O /B.I
  /B.O /B.O /B.O /B.O /B.I /B.I /B.I /B.O
  /B.O /B.I /B.I /B.I /B.I /B.O /B.O /B.O
  B.0

@B.rnd32.b
  /B.I /B.O /B.O /B.O /B.O /B.O /B.O /B.O
  /B.O /B.I /B.O /B.I /B.I /B.I /B.O /B.O
  /B.O /B.I /B.I /B.O /B.O /B.I /B.I /B.I
  /B.O /B.O /B.O /B.I /B.I /B.O /B.I /B.I
  /B.I /B.O /B.I /B.I /B.I /B.I /B.O /B.O
  /B.O /B.O /B.O /B.I /B.I /B.O /B.I /B.O
  /B.O /B.I /B.I /B.O /B.I /B.I /B.O /B.O
  /B.O /B.I /B.O /B.I /B.I /B.O /B.I /B.I
  B.0

@B.rnd256.a
  /B.O /B.I /B.O /B.O /B.O /B.I /B.O /B.O
  /B.I /B.I /B.O /B.O /B.I /B.I /B.O /B.I
  /B.O /B.O /B.O /B.I /B.O /B.O /B.O /B.O
  /B.I /B.O /B.I /B.I /B.I /B.I /B.I /B.O
  /B.O /B.O /B.I /B.O /B.I /B.O /B.O /B.I
  /B.O /B.O /B.I /B.O /B.I /B.O /B.O /B.I
  /B.O /B.I /B.I /B.I /B.I /B.O /B.O /B.I
  /B.O /B.O /B.I /B.I /B.O /B.O /B.I /B.I
  /B.O /B.O /B.O /B.O /B.I /B.O /B.O /B.O
  /B.O /B.O /B.I /B.O /B.O /B.I /B.I /B.O
  /B.O /B.O /B.O /B.O /B.I /B.O /B.O /B.O
  /B.I /B.O /B.I /B.O /B.I /B.O /B.I /B.I
  /B.O /B.O /B.I /B.O /B.I /B.I /B.O /B.I
  /B.I /B.I /B.O /B.I /B.I /B.O /B.O /B.I
  /B.O /B.O /B.I /B.O /B.I /B.I /B.O /B.I
  /B.O /B.O /B.I /B.O /B.O /B.I /B.I /B.I
  /B.O /B.I /B.O /B.O /B.O /B.I /B.I /B.O
  /B.O /B.O /B.O /B.O /B.I /B.I /B.I /B.O
  /B.I /B.I /B.I /B.I /B.O /B.I /B.O /B.O
  /B.O /B.I /B.I /B.I /B.I /B.I /B.O /B.I
  /B.O /B.I /B.O /B.I /B.I /B.O /B.O /B.O
  /B.O /B.O /B.O /B.I /B.I /B.O /B.I /B.O
  /B.O /B.I /B.O /B.I /B.O /B.O /B.O /B.I
  /B.O /B.O /B.O /B.I /B.I /B.O /B.O /B.O
  /B.I /B.I /B.O /B.I /B.I /B.O /B.I /B.O
  /B.I /B.O /B.O /B.O /B.O /B.O /B.I /B.O
  /B.I /B.O /B.I /B.O /B.I /B.O /B.I /B.O
  /B.I /B.O /B.O /B.I /B.O /B.O /B.I /B.I
  /B.I /B.O /B.I /B.O /B.I /B.O /B.I /B.O
  /B.O /B.O /B.I /B.O /B.I /B.I /B.I /B.I
  /B.I /B.O /B.O /B.I /B.O /B.O /B.O /B.O
  /B.O /B.I /B.I /B.I /B.I /B.I /B.I /B.I
  B.0

@B.rnd256.b
  /B.O /B.I /B.O /B.O /B.O /B.I /B.I /B.I
  /B.I /B.I /B.I /B.O /B.O /B.O /B.O /B.O
  /B.I /B.O /B.O /B.O /B.O /B.I /B.O /B.O
  /B.I /B.I /B.I /B.O /B.I /B.I /B.O /B.O
  /B.I /B.O /B.I /B.O /B.O /B.O /B.O /B.O
  /B.I /B.O /B.O /B.I /B.I /B.O /B.I /B.O
  /B.O /B.I /B.O /B.O /B.I /B.O /B.I /B.I
  /B.I /B.I /B.O /B.I /B.O /B.I /B.O /B.O
  /B.I /B.I /B.O /B.O /B.I /B.I /B.O /B.O
  /B.I /B.I /B.O /B.O /B.O /B.I /B.I /B.O
  /B.O /B.I /B.O /B.O /B.I /B.I /B.O /B.O
  /B.I /B.I /B.I /B.I /B.I /B.O /B.I /B.O
  /B.I /B.I /B.I /B.I /B.I /B.O /B.I /B.O
  /B.I /B.O /B.I /B.O /B.O /B.I /B.I /B.O
  /B.I /B.O /B.O /B.I /B.I /B.O /B.O /B.O
  /B.O /B.O /B.O /B.O /B.O /B.O /B.O /B.I
  /B.I /B.O /B.O /B.I /B.O /B.O /B.O /B.I
  /B.O /B.O /B.I /B.O /B.I /B.O /B.I /B.I
  /B.O /B.O /B.I /B.I /B.O /B.I /B.I /B.O
  /B.I /B.O /B.I /B.I /B.O /B.O /B.O /B.I
  /B.O /B.O /B.I /B.O /B.O /B.O /B.O /B.I
  /B.I /B.O /B.I /B.O /B.O /B.I /B.I /B.I
  /B.O /B.I /B.I /B.O /B.I /B.O /B.O /B.I
  /B.I /B.I /B.O /B.O /B.I /B.I /B.O /B.O
  /B.I /B.I /B.I /B.I /B.O /B.O /B.O /B.O
  /B.O /B.O /B.O /B.O /B.O /B.I /B.I /B.I
  /B.O /B.I /B.I /B.I /B.O /B.I /B.O /B.I
  /B.I /B.I /B.O /B.O /B.O /B.O /B.I /B.I
  /B.I /B.O /B.O /B.O /B.O /B.I /B.O /B.O
  /B.O /B.O /B.O /B.O /B.I /B.O /B.I /B.I
  /B.O /B.O /B.I /B.O /B.I /B.O /B.I /B.I
  /B.O /B.O /B.I /B.O /B.I /B.O /B.O /B.I
  B.0

@B.toC #size #xxs
  /T.trd
    //size
      #t /t #xxs
        //xxs
          #xs #add #ret ///T.new xs /C.double add             ret
          #xs #add #ret ///T.new xs /C.double add //C.add add ret
      ///T.new xxs C.1 C.0

@B.slowAdd #xxs #yys
  ////B.toC C.32 xxs B.suc yys

//B.peek C.32 //B.mul B.rnd32.a B.rnd32.b
`;


console.log(L.reduce(term, 1));
