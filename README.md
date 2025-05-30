## Technologies Used

I was attracted to writing a simple Python script since it would've been a bit less overhead for configuration compared to the technologies that I've been using recently with - such as **Node.js** or **.NET**. However, I felt more comfortable with the JavaScript syntax so I decided to use Node.

#### Packages:

- [csv-writer](https://www.npmjs.com/package/csv-writer) - for creating/writing csv files

- [jaro-winkler](https://www.npmjs.com/package/jaro-winkler) - for testing Jaro-Winkler algorithm

- [jest](https://www.npmjs.com/package/jest) - for unit testing

## The Approach

To be transparent, I've never used any normalization techniques on data before, so I pondered different approaches to this exercise.
I've used some string matching/weighted fuzzy matching methods before, but I understood string normalization had to be a bit more complex than simply removing whitespaces and comparing to existing strings in the database/cache.

Upon doing some research, I came across the Levenshtein Distance algorithm (most frequently used), and the Jaro-Winkler algorithm. After understanding a little bit about how these algorithms work, I first abstracted the idea of a function returning a similarity value from 0-1 (1 being a perfect match and 0 being a no-match) and used dynamic programming approach to cache similar strings in a map if the similarity value is greater than or equal to the threshold value we set. If no similar string is found, then simply insert the new normalized string into the cache.

Here's a basic [explanation](https://srinivas-kulkarni.medium.com/jaro-winkler-vs-levenshtein-distance-2eab21832fd6) of both of the algorithms:

**Levenshtein Distance**: String metric for measuring the difference between two sequences. Between two strings, we count the minimum number of single char edits, which includes deletion, insertion, substitution, required to change one string into the other. Then we do
1 - (LD value) / (max length of two strings) to get the similarity value.

**Jaro-Winkler**: String metric for measuring characters between two sequences in common, being no more than half the length of the longest string. It also takes into account of consideration for transpositions. The calculation is a bit more complex, but
the idea of similarity value is similar to the Levenshtein distance algorithm.

I decided to try both algorithms to see which method would work best with affiliated author strings. For the Levenshtein Distance algorithm, I implemented my own JavaScript function similar to [this](https://www.30secondsofcode.org/js/s/levenshtein-distance/) algorithm, and tried using [this](https://www.npmjs.com/package/jaro-winkler) npm package for the Jaro-Winkler algorithm. Leveraging JUST these algorithms along with the caching method, the Levenshtein Distance formula looked more appealing to me, as it felt like it was just strict enough to distinguish two strings that should seem like they should map to two different normalized strings, whereas Jaro-Winkler seemed more forgiving with the same threshold values set and better for shorter strings. For example - given the same threshold value - for a string like `MIT`, Jaro-Winkler would be better at finding similarity to a string like `mass inst of tech`, compared to Levenshtein Distance. Another example - I would personally think that `Massachusetts Institute of Technology Haystack Observatory` should be separate from `Massachusettes Institute of Technology, Cambridge, MA, USA`, so I would lean towards the Levenshtein distance algorithm.

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

This exercise offered valuable insights into data normalization techniques and their practical applications. The implementation showcases how string similarity algorithms can effectively standardize varied data formats while preserving meaningful relationships between entries. With adjustable thresholds, the solution provides flexibility to fine-tune the balance between precision and recall when matching similar strings.

With more time and additional data for testing, there’s definitely room for improvement. One area would be improving the formatting of normalized affiliation strings in the output CSV to enhance readability and make it more suitable for real-world database use. We could also optimize the program for handling very large datasets or improve fuzzy matching by filtering out common words like "the," "for," "and," "a," etc., before processing.

There’s no shortage of ways to build on this. Threshold values could be tuned to be either more forgiving or more strict, and we could explore which algorithms perform best at scale. Overall, this project meets the challenge of standardizing affiliation strings and lays a solid foundation for more advanced data normalization efforts.

## How to run the Script

If you do not have Node.js installed, please download through the [Node.js website](https://nodejs.org/en/download).

1. **Open Terminal/Command Prompt - Skip if you are familiar with cli!**

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

   - Make sure your input file is in **JSONL format**.
   - Place your input file in the same folder as the script. Ensure that the file is not extremely large. I noticed that `eto_swe_interview_data.jsonl` was more than 50 MB ...
   - FYI - `exampleInput.jsonl` exists in the directory for use. I used this file to test my script, so please refer to this for reference if you need to!!!

5. **Run the Script**

   - Basic usage (without threshold):

   ```
   node index.js exampleInput.jsonl output.csv
   ```

   - With threshold between 0.0 - 1.0 (optional):

   ```
   node index.js exampleInput.jsonl output.csv 0.4
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
