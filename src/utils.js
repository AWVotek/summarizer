function prettify(document){
    // Turns an array of words into lowercase and removes stopwords
    const stopwords = ["aber","als","am","an","auch","auf","aus","bei","bin","bis","bist","da","dadurch","daher","darum","das","daß","dass","dein","deine","dem","den","der","des","dessen","deshalb","die","dies","dieser","dieses","doch","dort","du","durch","ein","eine","einem","einen","einer","eines","er","es","euer","eure","für","hatte","hatten","hattest","hattet","hier","hinter","ich","ihr","ihre","im","in","ist","ja","jede","jedem","jeden","jeder","jedes","jener","jenes","jetzt","kann","kannst","können","könnt","machen","mein","meine","mit","muß","mußt","musst","müssen","müßt","nach","nachdem","nein","nicht","nun","oder","seid","sein","seine","sich","sie","sind","soll","sollen","sollst","sollt","sonst","soweit","sowie","und","unser","unsere","unter","vom","von","vor","wann","warum","was","weiter","weitere","wenn","wer","werde","werden","werdet","weshalb","wie","wieder","wieso","wir","wird","wirst","wo","woher","wohin","zu","zum","zur","über"];
    // turn document into lowercase words, remove all stopwords
    var document = document.replace(/[.,?!"()]/g, '');
    let document_in_lowercase = document.split(" ").map((x) => { 
        return x.toLowerCase();
    });
    return document_in_lowercase.filter( x => !stopwords.includes(x));
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

    // there are more than points to seperate sentences
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

/**
 * Calculate the TF of sentences. Sum of all TFs of words in sentences divided by number of words in sentence - stop words
 * @param {array} sentences 
 * @param {dict} TFVals 
 */
function calculateTFSentences(sentences, TFVals) {
    // splits it up into sentences now
    var TFSentences = {};
    // for every sentence
    sentences.forEach(sentence => {
        let sentenceTF = 0.0;
        let prettySentence = prettify(sentence);
        let numberOfNonStopWords = prettySentence.length;
        
        prettySentence.forEach(word => {
            sentenceTF += TFVals[word];
        });

        TFSentences[sentence] = sentenceTF / numberOfNonStopWords;
    });

    return TFSentences;
}

function termFrequency(document){
    // calculates term frequency of each sentence
    let words_without_stopwords = prettify(document);
    const sentences = getSentences(document);

    const TFVals = countWords(words_without_stopwords);
    const totalNumberOfWords = words_without_stopwords.length;
    // actually makes it TF values according to formula
    for (const [word, occurence] of Object.entries(TFVals)){
        TFVals[word] = occurence / totalNumberOfWords;
    }

    return calculateTFSentences(sentences, TFVals);
}

function inverseDocumentFrequency(document){
    // calculates the inverse document frequency of every sentence
    const words_without_stopwords = prettify(document);
    const unique_words_set = uniqueWords(words_without_stopwords);
    const sentences = getSentences(document);
    const lengthOfDocuments = sentences.length;    
    const wordCountAll = countWords(words_without_stopwords);

    // as each sentence is a document 
    // TODO: use map
    let wordCountSentences = [];
    sentences.forEach(sentence => {
        wordCountSentences.push(countWords(prettify(sentence)));
    });

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

function sortResult(TFidfDict) {
    let sortedSentences = [];
    for (let sentence in TFidfDict) {
        sortedSentences.push([sentence, TFidfDict[sentence]]);
    }

    sortedSentences.sort((a,b) => {
        if (a[1] > b[1]) {
            return -1;
        } else if (a[1] < b[1]) {
            return 1;
        }
        return 0;
    });

    return sortedSentences;
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

    let sortedSentences = sortResult(TFidfDict);    

    let result = "<div id='overlay'>"

    if (sortedSentences.length < 3) {
        result += "Der Text ist zu kurz, sorry!";
    } else {
        // summary should be 20% of the sentences, why? I don't know. I only guess.
        let numberOfSentences = Math.floor(sortedSentences.length / 5);

        for (let i=0; i <= numberOfSentences; i++) {
            result += sortedSentences[i][0]+".<br>"
        }
    }
    
    return result+"</div>";
}