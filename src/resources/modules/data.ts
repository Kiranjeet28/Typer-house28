export interface Session {
    id: string;
    title: string;
    keys: string[];
    description: string;
    practiceText: string;
}

export interface Module {
    id: string;
    title: string;
    sessions: Session[];
}

export const modulesData: Module[] = [
    {
        id: "module1",
        title: "Home Row Mastery",
        sessions: [
            {
                id: "session1",
                title: "Left Home Row",
                keys: ["A", "S", "D", "F"],
                description: "Master the left-hand home row keys",
                practiceText: `asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf
fdsa fdsa fdsa fdsa fdsa fdsa fdsa fdsa fdsa fdsa
aaaa ssss dddd ffff aaaa ssss dddd ffff aaaa ssss
afaf afaf afaf asas asas asas adad adad adad adad
dfdf dfdf dfdf dada dada dada fafa fafa fafa fafa
asdf fdsa asdf fdsa asdf fdsa asdf fdsa asdf fdsa
sad sad sad sad dad dad dad fad fad fad fad fad fad
asdfa asdfa asdfa asdfa asdfa asdfa asdfa asdfa
a sad dad a sad dad a sad dad a sad dad a sad dad
fas fas fas das das das sas sas sas aas aas aas aas
asdf asdf fdsa fdsa asdf asdf fdsa fdsa asdf fdsa
sad dad fads ads fads ads fads ads fads ads fads
a sad lass a sad lass a sad lass a sad lass a sad
add a salad add a salad add a salad add a salad add
dad sad fad lad dad sad fad lad dad sad fad lad dad
af af af as as as ad ad ad fa fa fa sa sa sa da da
asdf fdsa asdf fdsa asdf fdsa asdf fdsa asdf fdsa
aaa sss ddd fff aaa sss ddd fff aaa sss ddd fff aaa
ads ads ads ads fads fads fads fads dads dads dads
safe safe safe safe safe safe safe safe safe safe`
            },
            {
                id: "session2",
                title: "Right Home Row",
                keys: ["J", "K", "L", ";"],
                description: "Master the right-hand home row keys",
                practiceText: `jkl; jkl; jkl; jkl; jkl; jkl; jkl; jkl; jkl; jkl;
;lkj ;lkj ;lkj ;lkj ;lkj ;lkj ;lkj ;lkj ;lkj ;lkj
jjjj kkkk llll ;;;; jjjj kkkk llll ;;;; jjjj kkkk
jkjk jkjk jkjk jljl jljl jljl j;j; j;j; j;j; j;j;
kjkj kjkj kjkj klkl klkl klkl k;k; k;k; k;k; k;k;
jkl; ;lkj jkl; ;lkj jkl; ;lkj jkl; ;lkj jkl; ;lkj
jak jak jak kal kal kal lal lal lal jak jak jak kal
jkl;j jkl;j jkl;j jkl;j jkl;j jkl;j jkl;j jkl;j jkl;j
a lad; a lad; a lad; a lad; a lad; a lad; a lad; a lad;
jal jal jal kal kal kal lal lal lal jak jak jak jal
jkl; jkl; ;lkj ;lkj jkl; jkl; ;lkj ;lkj jkl; ;lkj
all all all all jak jak jak jakkal kal kal kal lad
a jak; a jak; a jak; a jak; a jak; a jak; a jak; a jak;
jj kk ll ;; jj kk ll ;; jj kk ll ;; jj kk ll ;; jj kk
jak kal lal jak kal lal jak kal lal jak kal lal jak
jkl; ;lkj jkl; ;lkj jkl; ;lkj jkl; ;lkj jkl; ;lkj
jjj kkk lll ;;; jjj kkk lll ;;; jjj kkk lll ;;; jjj
all; all; all; all; all; all; all; all; all; all; all;
lad lad lad jak jak jak kal kal kal lad lad lad jak`
            },
            {
                id: "session3",
                title: "Home Row Alternating",
                keys: ["A", "S", "D", "F", "J", "K", "L", ";"],
                description: "Alternate between left and right hands",
                practiceText: `asdf jkl; asdf jkl; asdf jkl; asdf jkl; asdf jkl;
a; s; d; f; j; k; l; a; s; d; f; j; k; l; a; s; d;
ask ask ask ask lad lad lad lad jak jak jak jak ask
fall fall fall fall jak jak jak jak salad salad sad
as as as la la la ad ad ad ja ja ja ka ka ka la la
a sad lad asks a sad lad asks a sad lad asks a sad
flask flask flask flask flask flask flask flask flask
add a salad; add a salad; add a salad; add a salad;
a lass falls; a lass falls; a lass falls; a lass falls;
ask dad; ask dad; ask dad; ask dad; ask dad; ask dad;
salad salad salad salad salad salad salad salad salad
sad lads ask dads; sad lads ask dads; sad lads ask
dad has a flask; dad has a flask; dad has a flask;
allasks fall; all asks fall; all asks fall; all asks
a sad lass had a salad; a sad lass had a salad; a sad
flask flask flask flask flask flask flask flask flask
asdfjkl; asdfjkl; asdfjkl; asdfjkl; asdfjkl; asdfjkl;
as dad asks as dad asks as dad asks as dad asks as dad
half half half half half half half half half half half
a lad falls a lad falls a lad falls a lad falls a lad`
            },
            {
                id: "session4",
                title: "Home Row with G",
                keys: ["A", "S", "D", "F", "G"],
                description: "Add G key with left index finger",
                practiceText: `asdg asdg asdg asdg asdg asdg asdg asdg asdg asdg
gfds gfds gfds gfds gfds gfds gfds gfds gfds gfds
gggg aaaa ssss dddd ffff gggg aaaa ssss dddd ffff
gag gag gag gag sag sag sag sag dag dag dag dag fag
gas gas gas gas gad gad gad gad fag fag fag fag gas
a gag a gag a gag a gag a gag a gag a gag a gag a gag
saga saga saga saga saga saga saga saga saga saga saga
gad gad gad gad gad gad gad gad gad gad gad gad gad
add a gas add a gas add a gas add a gas add a gas add
dad has a gag dad has a gag dad has a gag dad has a
gaff gaff gaff gaff gaff gaff gaff gaff gaff gaff
asdgfdsa asdgfdsa asdgfdsa asdgfdsa asdgfdsa asdgfdsa
a sad saga a sad saga a sad saga a sad saga a sad saga
gags gags gags gags gags gags gags gags gags gags
gas fads gas fads gas fads gas fads gas fads gas fads
a lass has a gag a lass has a gag a lass has a gag a
dad adds gas dad adds gas dad adds gas dad adds gas
saga saga saga saga saga saga saga saga saga saga saga
gad gad gad gad gad gad gad gad gad gad gad gad gad
a glass a glass a glass a glass a glass a glass a glass`
            },
            {
                id: "session5",
                title: "Home Row with H",
                keys: ["H", "J", "K", "L", ";"],
                description: "Add H key with right index finger",
                practiceText: `hjkl; hjkl; hjkl; hjkl; hjkl; hjkl; hjkl; hjkl;
;lkjh ;lkjh ;lkjh ;lkjh ;lkjh ;lkjh ;lkjh ;lkjh
hhhh jjjj kkkk llll hhhh jjjj kkkk llll hhhh jjjj
hah hah hah hah jah jah jah jah kah kah kah kah lah
haj haj haj haj hak hak hak hak hal hal hal hal haj
a hal a hal a hal a hal a hal a hal a hal a hal a hal
hall hall hall hall hall hall hall hall hall hall
had had had had had had had had had had had had had
a jak had a hall a jak had a hall a jak had a hall a
lad has a hall lad has a hall lad has a hall lad has
hash hash hash hash hash hash hash hash hash hash
hjkl;hhjkl; hjkl;hhjkl; hjkl;hhjkl; hjkl;hhjkl; hjkl;h
a lash a lash a lash a lash a lash a lash a lash a
haj haj haj haj haj haj haj haj haj haj haj haj haj
hal has a jak hal has a jak hal has a jak hal has a
a lass had a hall a lass had a hall a lass had a hall
lad had a hash lad had a hash lad had a hash lad had
hall hall hall hall hall hall hall hall hall hall
hah hah hah hah hah hah hah hah hah hah hah hah hah
a hall; a hall; a hall; a hall; a hall; a hall; a hall;`
            },
            {
                id: "session6",
                title: "Complete Home Row",
                keys: ["A", "S", "D", "F", "G", "H", "J", "K", "L", ";"],
                description: "Practice all home row keys together",
                practiceText: `asdfghjkl; asdfghjkl; asdfghjkl; asdfghjkl; asdfghjkl;
a sad lad had a glass; a sad lad had a glass; a sad
dad has a flask; dad has a flask; dad has a flask;
all gals had a hall; all gals had a hall; all gals
a lass falls; a lass falls; a lass falls; a lass falls;
half half half half half half half half half half
glass glass glass glass glass glass glass glass glass
lads ask dads; lads ask dads; lads ask dads; lads ask
a flask has gas; a flask has gas; a flask has gas; a
dad shall add a salad; dad shall add a salad; dad shall
slash slash slash slash slash slash slash slash slash
all lads had a saga; all lads had a saga; all lads had
ask jak; ask jak; ask jak; ask jak; ask jak; ask jak;
lads shall ask dads; lads shall ask dads; lads shall
a lass had half a salad; a lass had half a salad; a
gash gash gash gash gash gash gash gash gash gash
dad has a hall; dad has a hall; dad has a hall; dad has
all gals fall; all gals fall; all gals fall; all gals
flask glass hall salad flask glass hall salad flask
a dad shall ask jak; a dad shall ask jak; a dad shall`
            }
        ]
    },
    {
        id: "module2",
        title: "Top Row Introduction",
        sessions: [
            {
                id: "session1",
                title: "Left Top Row",
                keys: ["Q", "W", "E", "R"],
                description: "Learn left-hand top row keys",
                practiceText: `qwer qwer qwer qwer qwer qwer qwer qwer qwer qwer
rewq rewq rewq rewq rewq rewq rewq rewq rewq rewq
qqqq wwww eeee rrrr qqqq wwww eeee rrrr qqqq wwww
qeqe qeqe qeqe qwqw qwqw qwqw qrqr qrqr qrqr qrqr
wewe wewe wewe wrwr wrwr wrwr were were were were
qwer rewq qwer rewq qwer rewq qwer rewq qwer rewq
ewe ewe ewe ewe ere ere ere ere ewe ewe ewe ewe ere
qwerqwer qwerqwer qwerqwer qwerqwer qwerqwer qwerqwer
we were we were we were we were we were we were we
rew rew rew rew wer wer wer wer qwe qwe qwe qwe rew
qwer qwer rewq rewq qwer qwer rewq rewq qwer rewq
ewe ere ewe ere ewe ere ewe ere ewe ere ewe ere ewe
we were we were we were we were we were we were we
qq ww ee rr qq ww ee rr qq ww ee rr qq ww ee rr qq
were were were were were were were were were were
qwer rewq qwer rewq qwer rewq qwer rewq qwer rewq
qqq www eee rrr qqq www eee rrr qqq www eee rrr qqq
ewe ewe ewe ewe ewe ewe ewe ewe ewe ewe ewe ewe ewe
were were were were were were were were were were`
            },
            {
                id: "session2",
                title: "Right Top Row",
                keys: ["U", "I", "O", "P"],
                description: "Learn right-hand top row keys",
                practiceText: `uiop uiop uiop uiop uiop uiop uiop uiop uiop uiop
poiu poiu poiu poiu poiu poiu poiu poiu poiu poiu
uuuu iiii oooo pppp uuuu iiii oooo pppp uuuu iiii
upup upup upup uiui uiui uiui uouo uouo uouo uouo
ipip ipip ipip ioio ioio ioio opop opop opop opop
uiop poiu uiop poiu uiop poiu uiop poiu uiop poiu
pup pup pup pup poi poi poi poi pup pup pup pup poi
uiopuiop uiopuiop uiopuiop uiopuiop uiopuiop uiopuiop
up up up up poi poi poi poi up up up up poi poi poi
piu piu piu piu oui oui oui oui pip pip pip pip piu
uiop uiop poiu poiu uiop uiop poiu poiu uiop poiu
poi poi poi poi pup pup pup pup poi poi poi poi pup
up up up up poi poi poi poi up up up up poi poi poi
uu ii oo pp uu ii oo pp uu ii oo pp uu ii oo pp uu
poi poi poi poi poi poi poi poi poi poi poi poi poi
uiop poiu uiop poiu uiop poiu uiop poiu uiop poiu
uuu iii ooo ppp uuu iii ooo ppp uuu iii ooo ppp uuu
pup pup pup pup pup pup pup pup pup pup pup pup pup
poi poi poi poi poi poi poi poi poi poi poi poi poi`
            },
            {
                id: "session3",
                title: "Top Row with T",
                keys: ["Q", "W", "E", "R", "T"],
                description: "Add T key with left index finger",
                practiceText: `qwert qwert qwert qwert qwert qwert qwert qwert
trewq trewq trewq trewq trewq trewq trewq trewq
qqqq wwww eeee rrrr tttt qqqq wwww eeee rrrr tttt
tete tete tete tqtq tqtq tqtq twtw twtw twtw twtw
tree tree tree tree tree tree tree tree tree tree
qwert trewq qwert trewq qwert trewq qwert trewq
tee tee tee tee wet wet wet wet tee tee tee tee wet
qwertqwert qwertqwert qwertqwert qwertqwert qwertqwert
we wereweetwe were weet we were weet we were weet
ret ret ret ret wet wet wet wet tet tet tet tet ret
qwert qwert trewq trewq qwert qwert trewq trewq
tree tree tree tree tree tree tree tree tree tree
we were wet we were wet we were wet we were wet we
qq ww ee rr tt qq ww ee rr tt qq ww ee rr tt qq ww
tree tree tree tree tree tree tree tree tree tree
qwert trewq qwert trewq qwert trewq qwert trewq
qqq www eee rrr ttt qqq www eee rrr ttt qqq www eee
tweet tweet tweet tweet tweet tweet tweet tweet tweet
tree tree tree tree tree tree tree tree tree tree`
            },
            {
                id: "session4",
                title: "Top Row with Y",
                keys: ["Y", "U", "I", "O", "P"],
                description: "Add Y key with right index finger",
                practiceText: `yuiop yuiop yuiop yuiop yuiop yuiop yuiop yuiop
poiuy poiuy poiuy poiuy poiuy poiuy poiuy poiuy
yyyy uuuu iiii oooo pppp yyyy uuuu iiii oooo pppp
yoyo yoyo yoyo yuyu yuyu yuyu ypyp ypyp ypyp ypyp
yup yup yup yup yup yup yup yup yup yup yup yup yup
yuiop poiuy yuiop poiuy yuiop poiuy yuiop poiuy
you you you you puy puy puy puy you you you you puy
yuiopyu yuiopyu yuiopyu yuiopyu yuiopyu yuiopyu yuiopyu
you up you up you up you up you up you up you up you
yup yup yup yup yup yup yup yup yup yup yup yup yup
yuiop yuiop poiuy poiuy yuiop yuiop poiuy poiuy
you you you you you you you you you you you you you
you up you up you up you up you up you up you up you
yy uu ii oo pp yy uu ii oo pp yy uu ii oo pp yy uu
yup yup yup yup yup yup yup yup yup yup yup yup yup
yuiop poiuy yuiop poiuy yuiop poiuy yuiop poiuy
yyy uuu iii ooo ppp yyy uuu iii ooo ppp yyy uuu iii
you you you you you you you you you you you you you
yup yup yup yup yup yup yup yup yup yup yup yup yup`
            },
            {
                id: "session5",
                title: "Complete Top Row",
                keys: ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
                description: "Practice all top row keys",
                practiceText: `qwertyuiop qwertyuiop qwertyuiop qwertyuiop qwertyuiop
you type you type you type you type you type you type
quote quote quote quote quote quote quote quote quote
write write write write write write write write write
you were you were you were you were you were you were
retire retire retire retire retire retire retire retire
poetry poetry poetry poetry poetry poetry poetry poetry
proper proper proper proper proper proper proper proper
were you were you were you were you were you were you
type typewriter type typewriter type typewriter type
quit quit quit quit quit quit quit quit quit quit quit
pretty pretty pretty pretty pretty pretty pretty pretty
write poetry write poetry write poetry write poetry
you were proper you were proper you were proper you
rope rope rope rope rope rope rope rope rope rope rope
quite quite quite quite quite quite quite quite quite
upper upper upper upper upper upper upper upper upper
rewrite poetry rewrite poetry rewrite poetry rewrite
quote your quote your quote your quote your quote your
power power power power power power power power power`
            },
            {
                id: "session6",
                title: "Top & Home Row Mix",
                keys: ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P", "A", "S", "D", "F", "G", "H", "J", "K", "L", ";"],
                description: "Combine top and home rows",
                practiceText: `you asked you asked you asked you asked you asked you
she has a flask she has a flask she has a flask she has
please quote please quote please quote please quote
write poetry write poetry write poetry write poetry
glad glad glad glad glad glad glad glad glad glad glad
your head your head your head your head your head your
she was happy she was happy she was happy she was happy
all quality work all quality work all quality work all
he spoke gladly he spoke gladly he spoke gladly he
please please please please please please please please
great great great great great great great great great
she quit she quit she quit she quit she quit she quit
ask quietly ask quietly ask quietly ask quietly ask
your quote was proper your quote was proper your quote
he writes poetry he writes poetry he writes poetry he
loud loud loud loud loud loud loud loud loud loud loud
please help please help please help please help please
she was glad she was glad she was glad she was glad
your work was super your work was super your work was
quiet quiet quiet quiet quiet quiet quiet quiet quiet`
            },
            {
                id: "session6",
                title: "All Three Rows",
                keys: ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P", "A", "S", "D", "F", "G", "H", "J", "K", "L", ";", "Z", "X", "C", "V", "B", "N", "M", ",", ".", "/"],
                description: "Integrate all letter rows",
                practiceText: `the quick brown fox jumps over the lazy dog,
pack my box with five dozen liquor jugs.
how vexingly quick daft zebras jump!
the five boxing wizards jump quickly.
sphinx of black quartz, judge my vow.
waltz, bad nymph, for quick jigs vex.
quick zephyrs blow, vexing daft jim.
the jay, pig, fox, zebra and my wolves quack!
blowzy red vixens fight for a quick jump.
joaquin phoenix was quickly gazed by me.
crazy frederick bought many very exquisite opal jewels.
sixty zippers were quickly picked from the woven jute bag.
a quick movement of the enemy will jeopardize six gunboats.
all questions asked by five watch experts amazed the judge.
jack quietly moved up front and seized the big ball of wax.
the job requires extra pluck and zeal from every young wage earner.
a quivering texas zombie fought republic linked jewelry.
woven silk pyjamas exchanged for blue quartz.
brawny gods just flocked up to quiz and vex him.
quick wafting zephyrs vex bold jim.`
            }
        ]
    },
    {
        id: "module3",
        title: "Bottom Row Basics",
        sessions: [
            {
                id: "session1",
                title: "Left Bottom Row",
                keys: ["Z", "X", "C", "V"],
                description: "Learn left-hand bottom row keys",
                practiceText: `zxcv zxcv zxcv zxcv zxcv zxcv zxcv zxcv zxcv zxcv
vcxz vcxz vcxz vcxz vcxz vcxz vcxz vcxz vcxz vcxz
zzzz xxxx cccc vvvv zzzz xxxx cccc vvvv zzzz xxxx
zvzv zvzv zvzv zxzx zxzx zxzx zczc zczc zczc zczc
xvxv xvxv xvxv xcxc xcxc xcxc cvxv cvxv cvxv cvxv
zxcv vcxz zxcv vcxz zxcv vcxz zxcv vcxz zxcv vcxz
zax zax zax zax vac vac vac vac zax zax zax zax vac
zxcvzxcv zxcvzxcv zxcvzxcv zxcvzxcv zxcvzxcv zxcvzxcv
zac zac zac zac zac zac zac zac zac zac zac zac zac
vex vex vex vex zax zax zax zax cox cox cox cox vex
zxcv zxcv vcxz vcxz zxcv zxcv vcxz vcxz zxcv vcxz
zac zac zac zac zac zac zac zac zac zac zac zac zac`
            },
            {
                id: "session2",
                title: "Right Bottom Row",
                keys: ["M", ",", ".", "/"],
                description: "Learn right-hand bottom row keys",
                practiceText: `m,./ m,./ m,./ m,./ m,./ m,./ m,./ m,./ m,./ m,./
/.,m /.,m /.,m /.,m /.,m /.,m /.,m /.,m /.,m /.,m
mmmm ,,,, .... //// mmmm ,,,, .... //// mmmm ,,,,
m/m/ m/m/ m/m/ m,m, m,m, m,m, m.m. m.m. m.m. m.m.
,/,/ ,/,/ ,/,/ ,.,. ,.,. ,.,. ./., ./., ./., ./.,
m,./ /.,m m,./ /.,m m,./ /.,m m,./ /.,m m,./ /.,m
mam mam mam mam mal mal mal mal mam mam mam mam mal
m,./m,./ m,./m,./ m,./m,./ m,./m,./ m,./m,./ m,./m,./
ma, ma, ma, ma, ma, ma, ma, ma, ma, ma, ma, ma, ma,
mel mel mel mel mil mil mil mil mul mul mul mul mel
m,./ m,./ /.,m /.,m m,./ m,./ /.,m /.,m m,./ /.,m`
            },
            {
                id: "session3",
                title: "Bottom Row with B",
                keys: ["Z", "X", "C", "V", "B"],
                description: "Add B key with left index finger",
                practiceText: `zxcvb zxcvb zxcvb zxcvb zxcvb zxcvb zxcvb zxcvb
bvcxz bvcxz bvcxz bvcxz bvcxz bvcxz bvcxz bvcxz
zzzz xxxx cccc vvvv bbbb zzzz xxxx cccc vvvv bbbb
bvbv bvbv bvbv bzbz bzbz bzbz bxbx bxbx bxbx bxbx
cab cab cab cab cab cab cab cab cab cab cab cab cab
zxcvb bvcxz zxcvb bvcxz zxcvb bvcxz zxcvb bvcxz
baz baz baz baz bax bax bax bax baz baz baz baz bax
zxcvbzxcvb zxcvbzxcvb zxcvbzxcvb zxcvbzxcvb zxcvbzxcvb
cab cab cab cab cab cab cab cab cab cab cab cab cab`
            },
            {
                id: "session4",
                title: "Bottom Row with N",
                keys: ["N", "M", ",", ".", "/"],
                description: "Add N key with right index finger",
                practiceText: `nm,./ nm,./ nm,./ nm,./ nm,./ nm,./ nm,./ nm,./
/.,mn /.,mn /.,mn /.,mn /.,mn /.,mn /.,mn /.,mn
nnnn mmmm ,,,, .... //// nnnn mmmm ,,,, .... ////
nmnm nmnm nmnm n,n, n,n, n,n, n.n. n.n. n.n. n.n.
man man man man man man man man man man man man man
nm,./ /.,mn nm,./ /.,mn nm,./ /.,mn nm,./ /.,mn
nan nan nan nan nam nam nam nam nan nan nan nan nam
nm,./nm,./ nm,./nm,./ nm,./nm,./ nm,./nm,./ nm,./nm,./
man, man, man, man, man, man, man, man, man, man,
men men men men min min min min men men men men min`
            },
            {
                id: "session5",
                title: "Complete Bottom Row",
                keys: ["Z", "X", "C", "V", "B", "N", "M", ",", ".", "/"],
                description: "Practice all bottom row keys",
                practiceText: `zxcvbnm,./ zxcvbnm,./ zxcvbnm,./ zxcvbnm,./ zxcvbnm,./
box, man, cab, mix, van, zoom box, man, cab, mix, van
can, box, man, zen, vex, ban can, box, man, zen, vex
mix, van, cab, nab, box, man mix, van, cab, nab, box
zen, cam, van, box, men, zap zen, cam, van, box, men
cab, mix, ban, van, nab, box cab, mix, ban, van, nab
can a man box, can a man box, can a man box, can a
van, cab, mix, man, ban, zen van, cab, mix, man, ban
zap, box, cam, nab, van, men zap, box, cam, nab, van
men can mix, men can mix, men can mix, men can mix`
            }
        ]
    },
    {
        id: "module3",
        title: "Bottom Row Basics",
        sessions: [
            {
                id: "session1",
                title: "Left Bottom Row",
                keys: ["Z", "X", "C", "V"],
                description: "Learn left-hand bottom row keys",
                practiceText: `zxcv zxcv zxcv zxcv zxcv zxcv zxcv zxcv zxcv zxcv
vcxz vcxz vcxz vcxz vcxz vcxz vcxz vcxz vcxz vcxz
zzzz xxxx cccc vvvv zzzz xxxx cccc vvvv zzzz xxxx`
            },
            {
                id: "session2",
                title: "Right Bottom Row",
                keys: ["M", ",", ".", "/"],
                description: "Learn right-hand bottom row keys",
                practiceText: `m,./ m,./ m,./ m,./ m,./ /.,m /.,m /.,m /.,m
mmmm ,,,, .... //// mmmm ,,,, .... //// mmmm ,,,,
m/m/ m/m/ m/m/ m,m, m,m, m,m, m.m. m.m. m.m. m.m.`
            },
            {
                id: "session3",
                title: "Bottom Row with B",
                keys: ["Z", "X", "C", "V", "B"],
                description: "Add B key with left index finger",
                practiceText: `zxcvb zxcvb zxcvb zxcvb zxcvb bvcxz bvcxz bvcxz
zzzz xxxx cccc vvvv bbbb zzzz xxxx cccc vvvv bbbb
bvbv bvbv bvbv bzbz bzbz bzbz bxbx bxbx bxbx bxbx`
            },
            {
                id: "session4",
                title: "Bottom Row with N",
                keys: ["N", "M", ",", ".", "/"],
                description: "Add N key with right index finger",
                practiceText: `nm,./ nm,./ nm,./ nm,./ /.,mn /.,mn /.,mn nnnn mmmm
nmnm nmnm nmnm n,n, n,n, n,n, n.n. n.n. n.n. n.n.`
            },
            {
                id: "session5",
                title: "Complete Bottom Row",
                keys: ["Z", "X", "C", "V", "B", "N", "M", ",", ".", "/"],
                description: "Practice all bottom row keys",
                practiceText: `zxcvbnm zxcvbnm zxcvbnm zxcvbnm zxcvbnm box man cab mix
can box man zen vex ban can box man zen vex mix van cab`
            },
            {
                id: "session6",
                title: "All Three Rows",
                keys: ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P", "A", "S", "D", "F", "G", "H", "J", "K", "L", ";", "Z", "X", "C", "V", "B", "N", "M", ",", ".", "/"],
                description: "Integrate all letter rows",
                practiceText: `quick brown fox quick brown fox quick brown fox
pack my box pack my box pack my box the quick fox jumps
type quick type quick type quick quick zephyrs`
            }
        ]
    },
    {
        id: "module4",
        title: "Number Row",
        sessions: [
            {
                id: "session1",
                title: "Left Numbers",
                keys: ["1", "2", "3", "4", "5"],
                description: "Learn left-hand number keys",
                practiceText: `12345 12345 12345 11122 33344 55555 12345 54321
11111 22222 33333 44444 55555 12345 23451 34512`
            },
            {
                id: "session2",
                title: "Right Numbers",
                keys: ["6", "7", "8", "9", "0"],
                description: "Learn right-hand number keys",
                practiceText: `67890 67890 99988 77766 67890 09876 67890 67890
66666 77777 88888 99999 00000 67890 87654`
            },
            {
                id: "session3",
                title: "All Numbers",
                keys: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"],
                description: "Practice all number keys",
                practiceText: `1234567890 0987654321 1122334455 6677889900 1234509876
1010101010 1212121212 9876543210 1029384756`
            },
            {
                id: "session4",
                title: "Numbers with Letters",
                keys: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
                description: "Mix numbers with top row letters",
                practiceText: `1q2w3e 4r5t6y 7u8i9o 0p0p 1q1q 2w2w 3e3e 4r4r 5t5t
q1w2 e3r4 t5y6 u7i8 o9p0 qwert 123qwe 456rty 789uio`
            }
        ]
    },
    {
        id: "module5",
        title: "Special Characters - Shift",
        sessions: [
            {
                id: "session1",
                title: "Capital Letters Left",
                keys: ["A", "S", "D", "F", "G"],
                description: "Practice capitals with right shift",
                practiceText: `ASDFG ASDFG ASDFG AASSS DDDFF GGFFA GGSSA ASDFG
AS A S D F G ASDFG ASDFG ASDFG`
            },
            {
                id: "session2",
                title: "Capital Letters Right",
                keys: ["H", "J", "K", "L", ";"],
                description: "Practice capitals with left shift",
                practiceText: `HJKL; HJKL; HHHJJ KKKLL ;;;;; HJHK JKLH HJKL;
HAL JAK KAL LAL HJKL HJKL HJKL`
            },
            {
                id: "session3",
                title: "Number Symbols Left",
                keys: ["!", "@", "#", "$", "%"],
                description: "Shift + left number keys",
                practiceText: `!@#! @#!@ #$%# $%$% !@#! @#!@ !!!@@@ ###$$$ %%%^^^
!@!@ #$#$ %%%!! @@@## $$$%% !1@2 #3$4 %5^6`
            },
            {
                id: "session4",
                title: "Number Symbols Right",
                keys: ["^", "&", "*", "(", ")"],
                description: "Shift + right number keys",
                practiceText: `^&*() ^&*() ^^^&&& ***((( )))^^^ ^&^& *(*(*) (&^)&
()() ()() **&& ^^%% **() ^^** &&^^`
            },
            {
                id: "session5",
                title: "Mixed Capitals",
                keys: ["A", "S", "D", "F", "G", "H", "J", "K", "L", ";", "Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
                description: "Random capital letter practice",
                practiceText: `QWERTY ASDFGH JKL;POIUY TREWQ LKJHG ASDFQ WERAS DFGHJ
QAZ WSX EDC RFV TGB YHN UJM IK, OL. P;: QWAS EDCR FTGB`
            }
        ]
    },
    {
        id: "module6",
        title: "Punctuation & Symbols",
        sessions: [
            {
                id: "session1",
                title: "Basic Punctuation",
                keys: [",", ".", "/", ";", "'"],
                description: "Common punctuation marks",
                practiceText: `.,.,., ;';';' ,/. /.,/., ;.;.; '',''','' .,, .;.
comma period slash semicolon apostrophe comma period slash`
            },
            {
                id: "session2",
                title: "Brackets & Braces",
                keys: ["[", "]", "{", "}"],
                description: "Practice bracket characters",
                practiceText: `[] [] [] [[]] {{}} {[]} [}{] []{} [][] {{{}}}
[{] {]} [ { } ] [ { } ] { [ ] } { { } }`
            },
            {
                id: "session3",
                title: "Quotes & Colon",
                keys: ["'", "\"", ":"],
                description: "Quotation marks and colons",
                practiceText: `' " : ' " : ' " : "Hello": "Test": 'Quote':
"She said": 'It is done': "End": 'Stop'`
            },
            {
                id: "session4",
                title: "Math Symbols",
                keys: ["+", "=", "-", "_"],
                description: "Mathematical operators",
                practiceText: `+ - = _ +++ --- === ___ +-= +=- =+_ -_+ ++== --==
sum+sum sum=diff diff-sum add_sub add_sub add_sub`
            },
            {
                id: "session5",
                title: "Special Symbols",
                keys: ["`", "~", "\\", "|", "<", ">", "?"],
                description: "Less common special characters",
                practiceText: "`~`~ \\|\\| <<>> ??? ~`~ `\\`\\ <<>> ||\\\\ ??"
            },
            {
                id: "session6",
                title: "All Symbols Mix",
                keys: ["!", "@", "#", "$", "%", "^", "&", "*", "(", ")", "[", "]", "{", "}", ";", ":", "'", "\"", ",", ".", "/", "?", "+", "=", "-", "_", "<", ">"],
                description: "Comprehensive symbol practice",
                practiceText: `!@#$ %^&* ()[] {}:; '"', ./? +=- _<> !@#! @#$$ %^&*()
[]{}:;'" <>/? +=-_ !@#$ %^&* ()[] {}:; '"', ./?`
            }
        ]
    },
    {
        id: "module7",
        title: "Word Building",
        sessions: [
            {
                id: "session1",
                title: "3-Letter Words",
                keys: ["A", "S", "D", "F", "G", "H", "J", "K", "L", ";"],
                description: "Type simple 3-letter words",
                practiceText: `cat dog man hat sad lad jam map lap sap gas had lad
tag jam pay key ask add lad gag had map lap`
            },
            {
                id: "session2",
                title: "4-Letter Words",
                keys: ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P", "A", "S", "D", "F", "G", "H", "J", "K", "L", ";"],
                description: "Type common 4-letter words",
                practiceText: `word type plan make list love read book note time
play game move bank like will word play make plan`
            },
            {
                id: "session3",
                title: "5-Letter Words",
                keys: ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P", "A", "S", "D", "F", "G", "H", "J", "K", "L", ";"],
                description: "Type medium length words",
                practiceText: `apple pearl toast light quick world table chair equal
plant teach share laugh built noted water`
            },
            {
                id: "session4",
                title: "Common Words",
                keys: ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P", "A", "S", "D", "F", "G", "H", "J", "K", "L", ";", "Z", "X", "C", "V", "B", "N", "M"],
                description: "Practice frequently used words",
                practiceText: `the and for that with this have from they will your been
about one all can her has more when there what which`
            },
            {
                id: "session5",
                title: "Words with Capitals",
                keys: ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P", "A", "S", "D", "F", "G", "H", "J", "K", "L", ";", "Z", "X", "C", "V", "B", "N", "M"],
                description: "Practice capitalized words",
                practiceText: `London Paris Tokyo Berlin Rome Spain Canada Brazil
Alice Bob Carol Dave Eve Frank Grace Henry Irene Jack
Capital Words Start With Uppercase Every Line`
            }
        ]
    },
    {
        id: "module8",
        title: "Sentences & Phrases",
        sessions: [
            {
                id: "session1",
                title: "Simple Sentences",
                keys: ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P", "A", "S", "D", "F", "G", "H", "J", "K", "L", ";", "Z", "X", "C", "V", "B", "N", "M", ",", " ", "."],
                description: "Type basic sentences with spaces",
                practiceText: `The cat sat on the mat. The sun is hot. I like tea.
She runs fast. He has a hat. We walk home. They sing loud.`
            },
            {
                id: "session2",
                title: "Sentences with Punctuation",
                keys: ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P", "A", "S", "D", "F", "G", "H", "J", "K", "L", ";", "Z", "X", "C", "V", "B", "N", "M", ",", ".", " ", "?", "!"],
                description: "Add punctuation to sentences",
                practiceText: `What is your name? How are you! I am fine, thank you.
Stop! Wait, please. Who is there? Where are we going?`
            },
            {
                id: "session3",
                title: "Sentences with Capitals",
                keys: ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P", "A", "S", "D", "F", "G", "H", "J", "K", "L", ";", "Z", "X", "C", "V", "B", "N", "M", ",", " ", "."],
                description: "Proper capitalization in sentences",
                practiceText: `Alice went to the market. Bob bought fresh apples.
Tomorrow is Monday. January is cold. Always start sentences with capitals.`
            },
            {
                id: "session4",
                title: "Sentences with Numbers",
                keys: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P", "A", "S", "D", "F", "G", "H", "J", "K", "L", ";", "Z", "X", "C", "V", "B", "N", "M", " "],
                description: "Mix numbers into sentences",
                practiceText: `I have 2 apples and 3 oranges. He is 30 years old.
Room 101 is ready. Call 555-0123 for details. 2023 is the year.`
            },
            {
                id: "session5",
                title: "Complex Sentences",
                keys: ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P", "A", "S", "D", "F", "G", "H", "J", "K", "L", ";", "Z", "X", "C", "V", "B", "N", "M", "1", "2", "3", "4", "5", "6", "7", "8", "9", "0", ",", ".", " ", "'", "\"", ":"],
                description: "Advanced sentence structures",
                practiceText: `When the bell rings, we will go outside: if it rains, we stay in.
"Please arrive on time," she said. It's been a long day, hasn't it?`
            }
        ]
    },
    {
        id: "module9",
        title: "Speed Building",
        sessions: [
            {
                id: "session1",
                title: "Common Digraphs",
                keys: ["T", "H", "E", "A", "N", "D"],
                description: "Practice common letter pairs (th, he, an, etc.)",
                practiceText: `the then than that they them there then these those
and land hand sand band stand grand handle the then`
            },
            {
                id: "session2",
                title: "Fast Word Combos",
                keys: ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P", "A", "S", "D", "F", "G", "H", "J", "K", "L", ";", "Z", "X", "C", "V", "B", "N", "M"],
                description: "Rapid-fire common word sequences",
                practiceText: `the quick brown fox the quick brown fox over the lazy dog
and the man ran and the dog sat in the sun and the cat`
            },
            {
                id: "session3",
                title: "Paragraph Practice",
                keys: ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P", "A", "S", "D", "F", "G", "H", "J", "K", "L", ";", "Z", "X", "C", "V", "B", "N", "M", " ", ",", "."],
                description: "Type full paragraphs for fluency",
                practiceText: `Practice makes perfect. Type each line with focus and accuracy. Read the sentence, then type it steadily. Keep a steady rhythm and don't rush. Accuracy first, then speed.`
            },
            {
                id: "session4",
                title: "Timed Challenges",
                keys: ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P", "A", "S", "D", "F", "G", "H", "J", "K", "L", ";", "Z", "X", "C", "V", "B", "N", "M"],
                description: "Speed tests with time limits",
                practiceText: `Ready set go type fast type faster now keep going don't slow down
quick quick quick speed up steady hands focus on words not mistakes`
            },
            {
                id: "session5",
                title: "Mixed Content Speed",
                keys: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P", "A", "S", "D", "F", "G", "H", "J", "K", "L", ";", "Z", "X", "C", "V", "B", "N", "M", " ", ",", ".", "!", "?"],
                description: "Fast typing with varied content",
                practiceText: `Type 123 quickly! Now try this sentence. Speed up: don't sacrifice accuracy.
Practice, repeat, improve. 1 2 3 4 5! Are you ready? Go!`
            }
        ]
    },
    {
        id: "module10",
        title: "Professional Typing",
        sessions: [
            {
                id: "session1",
                title: "Email Practice",
                keys: ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P", "A", "S", "D", "F", "G", "H", "J", "K", "L", ";", "Z", "X", "C", "V", "B", "N", "M", "@", ".", " ", ","],
                description: "Type professional emails",
                practiceText: `Dear Team, I hope you are well. Please find the report attached.
Regards, John Doe. Please review and share feedback by Friday. Thanks, John.`
            },
            {
                id: "session2",
                title: "Code Syntax",
                keys: ["{", "}", "[", "]", "(", ")", ";", ":", "=", "+", "-", "*", "/", "<", ">"],
                description: "Practice programming symbols",
                practiceText: `function add(a, b) { return a + b; } // add values
if (x > y) { console.log("x>y"); } else { console.log("y>=x"); }`
            },
            {
                id: "session3",
                title: "URLs & Paths",
                keys: ["H", "T", "P", "S", ":", "/", ".", "W", "W"],
                description: "Type web addresses and file paths",
                practiceText: `https://www.example.com /home/user/projects/index.html http://site.org/page
ftp://server.local/path/to/file /var/log/syslog C:\\Users\\User\\Documents`
            },
            {
                id: "session4",
                title: "Data Entry",
                keys: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0", ",", ".", " "],
                description: "Numbers and structured data",
                practiceText: `100,000.00 50,000.00 1,234.56 12,345 99,999 0.00 12345 67890
2023 04 15 2023-04-15 15:30 08:00 17:00`
            },
            {
                id: "session5",
                title: "Technical Writing",
                keys: ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P", "A", "S", "D", "F", "G", "H", "J", "K", "L", ";", "Z", "X", "C", "V", "B", "N", "M", "1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "(", ")", "[", "]", "{", "}", "-", "_"],
                description: "Technical documentation practice",
                practiceText: `Section 1.1: Overview (Requirements)
- Install dependencies: npm install
- Run tests: npm test
Ensure all modules compile and pass CI checks. Document API endpoints and include examples.`
            }
        ]
    }
];