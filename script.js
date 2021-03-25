var rows = 9;
var cols = 9;
var percent = 12;
var N = rows*cols; //Number of squares
var B = Math.ceil(percent * N / 100.0); //Number of bombs
var firstTime = true;
var isGameOn = true;

var board = []; //-1--->BOMB    (0-8)--->no.of bombs in surrounding squares
var bombs = []; //IDs of the divs containing bombs
var isRevealed = [];
var flagged = []; //IDs of the divs that are flagged

function placeBombs(forbidden)
{
    for(let i=0;i<B;i++)
    {
        var id = Math.floor((Math.random()*N));
        while(bombs.includes(id) || forbidden.includes(id))
        {
            id = Math.floor((Math.random()*N));
        }
        bombs.push(id);
	    board[id] = -1;
    }
}

function findNeighbours(sqid) //Returs the 8(or less) neighbouring square's IDs
{
    var ans = [];
    var isLeft = (sqid % cols) == 0;
    var isrowsight = ((sqid % cols) == (cols-1));
    var isTop = (sqid < cols);
    var isDown = sqid >= ((rows-1)*cols);
    
    if(!isTop)
        ans.push(sqid-cols);

    if(!isTop && !isrowsight)
        ans.push(sqid-cols+1);

    if(!isrowsight)
        ans.push(sqid+1);

    if(!isrowsight && !isDown)
        ans.push(sqid+cols+1);

    if(!isDown)
        ans.push(sqid+cols);

    if(!isDown && !isLeft)
        ans.push(sqid+cols-1);

    if(!isLeft)
        ans.push(sqid-1);

    if(!isLeft && !isTop)
        ans.push(sqid-cols-1);

    return ans;
}

function numberSquares()
{
    for(let sqid=0;sqid<N;sqid++)
    {
        if(board[sqid] == -1)
            continue;
        const arr = findNeighbours(sqid);
        var total = 0;
        for(let i=0;i<arr.length;i++)
        {
            if(board[arr[i]] == -1)
                total++;
        }
        board[sqid] = total;
    }
}

function checkWin()
{
    var notRevealed = isRevealed.filter(x => !x ).length;
    if(notRevealed == B)
    {
        isGameOn = false;
        setTimeout(function()
        {
            alert("You Win !! \nPlease refresh the page to play again.");
        }, 1000);
    }
}

function endGame(sqid)
{
    isGameOn = false;
    const mine_img = '<img src="Images/mine.png"/>';
    document.getElementById(sqid).innerHTML = mine_img;
    // Reveal all bombs
    for(let i=0;i<B;i++)
    {
    	setTimeout(function()
        {
            document.getElementById(bombs[i]).innerHTML = mine_img;
        }, 200*(i+1));
    }
    setTimeout(function()
    {
        alert("Game Over \nPlease refresh the page to play again.");
    }, 1000+(B*200));
}

function reveal(sqid)
{
    if(isRevealed[sqid] || flagged.includes(sqid) || !(sqid>=0 && sqid<N))
        return ;

    isRevealed[sqid] = true;
    document.getElementById(""+sqid).style.backgroundColor = "#ffffff";

    if(board[sqid] == -1)
    {        
        endGame(sqid);
        return ;
    }

    if(board[sqid] == 0)
    {
        var arr = findNeighbours(sqid);
        for(let i=0;i<arr.length;i++)
        {
            reveal(arr[i]);
        }
        return ;
    }
    document.getElementById(sqid).innerHTML = board[sqid];
    checkWin();
}

function clicked(sq)
{
    if(!isGameOn)
        return ;
    const sqid = parseInt(sq.target.id);
    
    if(firstTime)
    {
        firstTime = false;
        var forbidden = [];
        var arr = findNeighbours(sqid);
        arr.push(sqid);
        for(let i=0;i<arr.length;i++)
        {
    	    forbidden.push(arr[i]);
	    }
        placeBombs(forbidden);
        numberSquares();

        var sec = 0;
        setInterval(function()
        { 
            if(isGameOn)
                sec++;
            document.getElementById("time").value = sec;
        },1000);

        for(let i=0;i<arr.length;i++)
            reveal(arr[i]);
    }
    else
        reveal(sqid);
}

function rClicked(sqid)
{
    if(!isGameOn || isRevealed[sqid])
        return ;
    var f = parseInt(document.getElementById("minesLeft").value);

    if(flagged.includes(sqid))
    {
        document.getElementById(sqid).innerHTML = "";
        flagged.splice(flagged.indexOf(sqid),1); //Removing sqid form flagged[]
        document.getElementById("minesLeft").value = (f+1);
        return ;
    }
    document.getElementById(sqid).innerHTML = '<img src="Images/flag.png"/>';
    document.getElementById("minesLeft").value = (f-1);
    flagged.push(sqid);
}

function deleteBoard()
{
    for(let i=0;i<N;i++)
        document.getElementById(i).remove();
}

function createBoard()
{
    var grid = document.querySelector(".grid");
    grid.style.width = (30*cols) + "px";
    grid.style.height = (30*rows) + "px";
    grid.style.border = "1px solid black";

    for(let i=0;i<N;i++)
    {
        const sq = document.createElement("div");
        sq.setAttribute("id",i);
        sq.addEventListener("click", clicked);
        sq.oncontextmenu = function ()
        {
            rClicked(i);
        }
        grid.appendChild(sq);        
        board.push(0);
        isRevealed.push(false);
    }
}

function resetBoard()
{
    deleteBoard();
    N = rows*cols;
    B = Math.ceil(percent * N / 100.0);
    board = []; 
    bombs = [];
    isRevealed = [];
    flagged = [];
    document.getElementById("minesLeft").value = B;
    document.getElementById("displayBombs").value = B;
    createBoard();
}

document.getElementById("rows").oninput = function()
{
    rows = parseInt(this.value);
    document.getElementById("displayRows").value = rows;
    resetBoard();
}

document.getElementById("cols").oninput = function()
{
    cols = parseInt(this.value);
    document.getElementById("displayCols").value = cols;
    resetBoard();
}

document.getElementById("bombs").oninput = function()
{
    percent = parseInt(this.value);
    resetBoard();
}

document.addEventListener('contextmenu', event => event.preventDefault());
createBoard();