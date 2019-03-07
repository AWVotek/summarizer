function readStopsWords() {
    return ["aber","als","am","an","auch","auf","aus","bei","bin","bis","bist","da","dadurch","daher","darum","das","daß","dass","dein","deine","dem","den","der","des","dessen","deshalb","die","dies","dieser","dieses","doch","dort","du","durch","ein","eine","einem","einen","einer","eines","er","es","euer","eure","für","hatte","hatten","hattest","hattet","hier","hinter","ich","ihr","ihre","im","in","ist","ja","jede","jedem","jeden","jeder","jedes","jener","jenes","jetzt","kann","kannst","können","könnt","machen","mein","meine","mit","muß","mußt","musst","müssen","müßt","nach","nachdem","nein","nicht","nun","oder","seid","sein","seine","sich","sie","sind","soll","sollen","sollst","sollt","sonst","soweit","sowie","und","unser","unsere","unter","vom","von","vor","wann","warum","was","weiter","weitere","wenn","wer","werde","werden","werdet","weshalb","wie","wieder","wieso","wir","wird","wirst","wo","woher","wohin","zu","zum","zur","über"];
}

function prettify(document){
    // Turns an array of words into lowercase and removes stopwords
    const stopwords = readStopsWords();
    // turn document into lowercase words, remove all stopwords
    var document = document.replace(/[.,?!]/g, '');
    let document_in_lowercase = document.split(" ").map((x) => { 
        return x.toLowerCase() 
    });
    return document_in_lowercase.filter( x => !stopwords.includes(x) );
}

function uniqueWords(words){
    const unique_words_set = new Set(words);
    return Array.from(unique_words_set);
}

function countWords(words){
    // returns a dictionary of {WORD: COUNT} where count is
    // how many times that word appears in "words".
    const unique_words = uniqueWords(words);
    let dict = {};
    // for every single unique word
    for (let i = 0; i <= unique_words.length - 1; i++){
        dict[unique_words[i]] = 0
        // see how many times this unique word appears in all words
        for (let x = 0; x <= words.length -1; x++){
            if (unique_words[i] == words[x]){
                dict[unique_words[i]] = dict[unique_words[i]] + 1;
            }
        }
    }
    return dict;
}

/*
TODO: Filter artefacts like version numbers, german dates etc. with dots
*/
function getSentences(document) {
    // gets rid of trailing spaces
    const sentences1 = document.split(".").map(item => item.trim());

    // there are more than points
    const sentences2 = [];
    sentences1.forEach(sentence => {
        if (sentence.indexOf("?") === -1) {
            sentences2.push(sentence);
        } else {
            let tmp = sentence.split("?");

            tmp.forEach(tmpS => {
                sentences2.push(tmpS);
            });
        }
    });

    return sentences2;
}

function termFrequency(document){
    // calculates term frequency of each sentence
    let words_without_stopwords = prettify(document);
    const sentences = getSentences(document);

    sentences[0] = sentences[0].substring(146);

    const TFVals = countWords(words_without_stopwords)
    const unique_words = uniqueWords(words_without_stopwords);

    // actually makes it TF values according to formula
    for (const [key, value] of Object.entries(TFVals)){
        TFVals[key] = TFVals[key] / words_without_stopwords.length;
    }

    // splits it up into sentences now
    var TFSentences = {};
    // for every sentence
    for (let i = 0; i <= sentences.length - 1; i ++){
        // for every word in that sentence
        let sentence_split_words = sentences[i].split(" ");
        // get the assiocated TF values of each word
        // temp.add is the "TF" value of a sentence, we need to divide it at the end
        let temp_add = 0.0;
        let words_no_stop_words_length = prettify(sentences[i]).length;
        for (let x = 0; x <= sentence_split_words.length - 1; x++){
            // get the assiocated TF value and add it to temp_add
            if (sentence_split_words[x].toLowerCase() in TFVals){
                // adds all the TF values up
                temp_add = temp_add + TFVals[sentence_split_words[x].toLowerCase()];
            }
            else{
                // nothing, since it's a stop word.
            }
        }
        // TF sentences divide by X number of items on top
        TFSentences[sentences[i]] = temp_add / words_no_stop_words_length;
    }
    
    return TFSentences;
}

function inverseDocumentFrequency(document){
    // calculates the inverse document frequency of every sentence
    const words_without_stopwords = prettify(document);
    const unique_words_set = uniqueWords(words_without_stopwords);

    const sentences = document.split(".").map(item => item.trim());
    sentences[0] = sentences[0].substring(146);

    const lengthOfDocuments = sentences.length;
    // prettifys each sentence so it doesn't have stopwords

    const wordCountAll = countWords(words_without_stopwords);

    // counts words of each sentence
    // as each sentence is a document
    let wordCountSentences = [];
    for (let i = 0; i <= lengthOfDocuments - 1; i ++){
        wordCountSentences.push(countWords(prettify(sentences[i])));
    }

    // calculate TF values of all documents
    let IDFVals = {};

    // how many times that word appears in all sentences (documents)
    let wordCountSentencesLength = wordCountSentences.length;
    // for every unique word
    for (let i = 0; i <= unique_words_set.length - 1; i++){
        let temp_add = 0;
        // count how many times unique word appears in all sentences
        for (let x = 0; x <= wordCountSentencesLength - 1; x++){
            if (unique_words_set[i] in wordCountSentences[x]){
                temp_add =+ 1;
            }
        }
        IDFVals[unique_words_set[i]] = Math.log10(wordCountAll[unique_words_set[i]] / temp_add);
    }

    let IDFSentences = {};
    // for every sentence
    for (let i = 0; i <= lengthOfDocuments - 1; i ++){
        // for every word in that sentence
        let sentence_split_words = sentences[i].split(" ");
        // get the assiocated IDF values of each word
        // temp.add is the "IDF" value of a sentence, we need to divide it at the end
        let temp_add = 0.0;
        let words_no_stop_words_length = prettify(sentences[i]).length;
        for (let x = 0; x <= sentence_split_words.length - 1; x++){
            // if the word is not a stopword, get the assiocated IDF value and add it to temp_add
            if (sentence_split_words[x].toLowerCase() in IDFVals){
                // adds all the IDF values up
                temp_add = temp_add + IDFVals[sentence_split_words[x].toLowerCase()];
            }
            else{
                // nothing, since it's a stop word.
            }
        }
        IDFSentences[sentences[i]] = temp_add / words_no_stop_words_length;
    }
return IDFSentences;
}

function TFIDF(documents){
    // calculates TF*IDF
    const TFVals = termFrequency(documents);
    const IDFVals = inverseDocumentFrequency(documents);

    let TFidfDict = {};

    for (const [key, value] of Object.entries(TFVals)){
        if (key in IDFVals){
            TFidfDict[key] = TFVals[key] * IDFVals[key];
        }
    }

    let max = 0.0;
    let max2 = 0.0;
    let max3 = 0.0;

    let max_sentence = "";
    let max2Sent = "";
    let max3Sent = "";

    // finds the top 3 sentences in TFidfDict
    for (const [key, value] of Object.entries(TFidfDict)){
        if (TFidfDict[key] > max){
            max = TFidfDict[key];
            max_sentence = key;
        }
        else if (TFidfDict[key] > max2 && TFidfDict[key] < max){
            max2 = TFidfDict[key];
            max2Sent = key;
        }
        else if (TFidfDict[key] > max3 && TFidfDict[key] < max2 && TFidfDict[key] < max){
            max3 = TFidfDict[key];
            max3Sent = key;
        }
    }

    if (max_sentence === "") {
        return "<tr><td>Der Text ist zu kurz, sorry!</td></tr>"
    }

    return "<tr><td>" + max_sentence + "</td></tr><tr><td>" + max2Sent + "</td></tr><tr><td>" + max3Sent + "</td></tr>";
}