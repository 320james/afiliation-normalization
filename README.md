# James Kim - Data Normalization Take-home Exercise

## Introduction

Note: Please use your IDE and open this file in Preview for readability and formatting. Eg. VSCode -> Right click README.md tab -> Open Preview

Hello CSET Team - my name is James, and I'm a software engineer at **WillowTree**. Thank you for the opportunity to partake in this take-home project!
I chose to complete **Option 1: Data Normalization** exercise. The second option seemed simpler, but I've never looked much into normalization of data
in my professional experience so I decided to give it a go. It took a little bit of time to do my due diligence on some common string normalization
techniques and weighing out the pros and cons, but it was a fun exercise to try out that was more data-centric.

## Technologies Used

When I first read the prompt, I was attracted to writing a simple Python script since it would've been a bit less overhead for configuration setup compared to the technologies that I've been using recently with - such as **Node.js** or **.NET**. However, I felt more comfortable with the JavaScript syntax so I decided to use Node. I apologize if you do not have Node.js installed already to evaluate this script.

#### Packages:

- [csv-writer](https://www.npmjs.com/package/csv-writer) - for creating/writing csv files

- [jaro-winkler](https://www.npmjs.com/package/jaro-winkler) - for testing Jaro-Winkler algorithm

- [jest](https://www.npmjs.com/package/jest) - for unit testing

## The Approach

To be transparent, I've never used any normalization techniques on data before, so I pondered different approaches to this exercise.
At my current client project called "VAConnects" - University of Virginia's new standardized assessment and user management
platform - I'm part of the entity management squad, so I've used some string matching/weighted fuzzy matching methods before to search users/students, but I understood string normalization had to be a bit more complex than simply removing whitespaces and comparing to existing strings in the database/cache.

Upon doing some research, I came across the Levenshtein Distance algorithm (most frequently used), and the Jaro-Winkler algorithm. After understanding a little bit about how these algorithms work, I first abstracted the idea of a function returning a similarity value from 0-1 (1 being a perfect match and 0 being a no-match) and used dynamic programming approach to cache similar strings in a map if the similarity value is greater than or equal to the threshold value we set. If no similar string is found, then simply insert the new normalized string into the cache.

Here's a basic [explanation](https://srinivas-kulkarni.medium.com/jaro-winkler-vs-levenshtein-distance-2eab21832fd6) of both of the algorithms:

**Levenshtein Distance**: String metric for measuring the difference between two sequences. Between two strings, we count the minimum number of single char edits, which includes deletion, insertion, substitution, required to change one string into the other. Then we do
1 - (LD value) / (max length of two strings) to get the similarity value.

**Jaro-Winkler**: String metric for measuring characters between two sequences in common, being no more than half the length of the longest string. It also takes into account of consideration for transpositions (char movements). The calculation is a bit more complex, but
the idea of similarity value is similar to the Levenshtein distance algorithm.

I decided to try both algorithms to see which method would work best with affiliated author strings. For the Levenshtein Distance algorithm, I implemented my own JavaScript function similar to [this](https://www.30secondsofcode.org/js/s/levenshtein-distance/) algorithm, and tried using [this](https://www.npmjs.com/package/jaro-winkler) npm package for the Jaro-Winkler algorithm. With the given MIT affiliation examples from the prompt, the results varied. Leveraging JUST these algorithms along with the caching method, the Levenshtein Distance formula looked more appealing to me, as it felt like it was just strict enough to distinguish two strings that should seem like they should map to two different normalized strings, whereas Jaro-Winkler seemed more forgiving with the same threshold values set and better for shorter strings. For example, for a string like `MIT`, Jaro-Winkler would be better at finding similarity to a string like `mass inst of tech`, compared to Levenshtein Distance. Another example - I would personally think that `Massachusetts Institute of Technology Haystack Observatory` should be separate from `Massachusettes Institute of Technology, Cambridge, MA, USA`, so I would lean towards the Levenshtein distance algorithm.

I did, however, add some options to the program to allow a little bit more exactness in the functionality.

There is a function in `utils.js` called `addNormalizationMapping`, which can be used to drastically improve mappings by manually mapping things like known acronyms for institutes, short name versions, etc. If these values are added prior to a larger data set input,
the dynamic caching method would work far better since we already have known set of data to refer to.

### Let's wrap up and summarize how this program works, step by step:

1. Read user arguments, catch usage errors.
2. Create CSV Writer for output file w/ two columns - `original_affiliation` and `normalized_affiliation`.
3. Read and parse JSONL data to turn into JSON objects.
4. Normalize author affiliations from the JSON objects using dynamic caching
5. Create a map for original strings and normalized strings.
6. Project the map to the output CSV file.
7. Print statistics about the normalization results.

### Conclusion

Overall, there are improvements that can be made with more time and data to test with. One improvement that I can think of is being able to format the normalized versions of the original affiliated strings when creating the output csv file, as it would be more readable applicable for a real-world use case with a database. Of course, the threshold values can be adjusted to be more forgiving or more strict, as well as we can go back and forth arguing whether or not one algorithm is better than the other for a bigger set of data. Given around 3-5 hours to complete this exercise, I believe this approach may be suitable for us. This was a fun exercise. Thank you!

## How to Run the Script

If you do not have Node.js installed, please download through the [Node.js website](https://nodejs.org/en/download).

1. **Open Terminal/Command Prompt - Skip if you are familiar with running scripts!**

   - Open terminal

2. **Navigate to the Project Folder**

   - `cd` into where the zip file will be opened
   - Open!

3. **Install Dependencies**

   - Type the following command and press Enter:

   ```
   npm install
   ```

4. **Prepare Your Input File**

   - Make sure your input file is in **JSONL format** (each line is a JSON object).
   - Place your input file in the same folder as the script
   - FYI - `exampleInput.jsonl` exists in the directory for use. I used this file to test my script, so please refer to this for reference!

5. **Run the Script**

   - Basic usage (without threshold):

   ```
   node index.js exampleInput.jsonl output.csv
   ```

   - With threshold between 0.0 - 1.0 (optional):

   ```
   node index.js exampleInput.jsonl output.csv 0.8
   ```

   - The threshold is a number between 0 and 1 (default is 0.7)
   - **Higher numbers** (closer to 1) mean stricter matching
   - **Lower numbers** (closer to 0) mean more lenient matching

6. **Check the Results**
   - After running the script, you'll find a new csv file in the same folder
   - This file contains two columns:
     - `original_affiliation`: The original text
     - `normalized_affiliation`: The normalized version

### To run the unit tests

```
npm run test
```

### Troubleshooting

If you encounter any errors:

1. Make sure **Node.js** is installed correctly
2. Ensure you're in the correct folder
3. Check that your input file exists and is in the correct format
4. Verify that you have write permissions in the folder
