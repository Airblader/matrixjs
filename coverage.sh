CURR_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

. ~/.nvm/nvm.sh && nvm use 0.8 && cd ~/.nvm/bin/node_modules/node-coverage 
node server.js --function -i "test/tests.js" -d "$CURR_DIR" -r "$CURR_DIR/reports" &
google-chrome "http://localhost:8787" && google-chrome "http://localhost:8080/test/tests.html" && read -p "Press Enter when tests finished running..." && killall node
wait
