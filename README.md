# mkD3

*mkD3* (or metaknowledgeD3) is a Javascript framework meant to accompany the python package *metaknowledge*. *mkD3* provides the functionality to create interactive *D3.js* visualizations from datasets produced by *metaknowledge*. Currently, *mkD3* accepts output generated with the `rpys()` and `getCitations()` methods in *metaknowledge* to produce Standard Referenced Publication Years Spectroscopy (RPYS) plots.

# Basic Use

## Preparing the files
All mkD3 functions take file paths as input. These files can all be generated using the *metaknowledge* python package.


### Standard-RPYS
Both Standard-RPYS functions (`standardBar()` and `standardLine()`) take in two csv files. To do this, we first create a record collection using *metaknowledge*. While I have provided a simple example of how to do this below, the [metaknowledge documentation](http://networkslab.org/metaknowledge/documentation/metaknowledgeFull.html#RecordCollection) discusses this process in more detail.

After we have created a record collection we can use the `rpys()` method. Supply optional arguments `minYear` and `maxYear` if you want to limit the years which are included in the resulting dictionary. Next, we can create a DataFrame and export it as a csv file.

A similar set of steps are taken to generate the citation information file. The code to generate both these files is shown below.
```
import metaknowledge as mk
import pandas

RC = mk.RecordCollection("/Users/path/to/a/WOS/RecordFile")

# Creating RPYSFile
rpys = RC.rpys(minYear=1900)
df = pandas.DataFrame.from_dict(rpys)
df.to_csv("/Users/saving/path/something.csv")

# Creating CitationFile
citations = RC.getCitations()
df = pandas.DataFrame.from_dict(citations)
df.to_csv("/Users/saving/path/something.csv")
```
### Multi-RPYS
`multiRPYS()` requires more specific data than the Standard-RPYS functions. To get these files, we can use the `multiRPYS_data.py` script found in *mkD3*'s [Resources folder](https://github.com/networks-lab/mkD3/tree/master/Resources) on GitHub.

To use this script, be sure to update the following lines:
- Line **20** determines the earliest year which will be included in the RPYS analysis
- Line **21** determines the latest year which will be included in the RPYS analysis
- Line **23** creates the record collection which will be used for analysis. Read *metaknowledge*'s full [documentation](http://networkslab.org/metaknowledge/documentation/metaknowledgeFull.html#RecordCollection) for how to create a RecordCollection.
- Line **51** specifies the filepath for the resulting RPYS .csv file. This will be the MultiRPYSFile used in the `multiRPYS()` function.
- Line **80** specifies the filepath for the resulting citation .csv. This will be the MultiCitationFile used in the `multiRPYS()` function.

## The Functions
Currently, three functions are available to users of mkD3. These three functions each take two files produced using *metaknowledge* as input and produce an interactive Referenced Publication Year Spectroscopy (RPYS) D3 graph.

### Standard Bar
`standardBar(RPYSFile, CitationFile)`   

This function takes in the path to two csv files. Both files can be generated using functions provided by the *metaknowledge* python package. A script which can be used to do this is described above under *Preparing the Files* section.

Once these files are generated they can be passed to `standardBar()` to generate a bar graph of a Standard-RPYS analysis. Each bar represents a year whose height is the number of times sources published in that year have been cited.

You may hover over individual bars to find the Standard-RPYS statistics for that year. Hovering also reveals the top 15 citations for the corresponding year in a table which appears under the bar graph.

### Standard Line
`standardLine(RPYSFile, CitationFile)`
This function takes in the path to two csv files. These files are the same as those used in `standardBar()` and thus can be generated using *metaknowledge* in the same way as described above.

`standardLine()` produces a line graph of a Standard-RPYS analysis. Each point in this graph represents a year, whose Y-position is the extent to which the year's number of citations has deviated from the five-year median. This median is calculated from the year itself as well as the two years preceding and the two years succeeding it.

You may hover over individual points to see the Standard-RPYS statistics for the corresponding year. Hovering also reveals the top 15 citations for the corresponding year in a table which appears under the line chart.

### Multi RPYS Heatmap
`multiRPYS(MultiRPYSFile, MultiCitationFile)`
This function takes in the path to two csv files. Once again, these files are generated using the *metaknowledge* python package. However, Multi-RPYS analysis requires the data identify both the year a work was published and the year it was cited. To do this, we have developed a python script which can generate these files. This script (`multiRPYS_data.py`), and its documentation, can be found in the Resources directory in the *mkD3* GitHub repository.

This function produces a heatmap of the Multi RPYS analysis. Darkly coloured boxes indicate publication years which have the highest ranks within a specific citation year. For instance, if a dark coloured box is found at X-position 1964 and Y-Position 1980, we know that publications in 1980 cited sources published in 1964 at a relatively high rate.

Once again, to find additional information on specific data points you may hover over the graph. When hovered over a box CPY(Citing Publication Year), RPY (Referenced Publication Year), raw frequency, and the deviation from the median-deviation are shown. Remember, CPY is the year a work is cited, while RPY is the year a work is published. Thus, RPY will always be less than or equal to CPY.

To view information on specific citation numbers, click on a box and the corresponding information will appear in the table below the heatmap.  

# To-Do
*mkD3* is a project currently under development. Thus, we expect there to be many future updates, improvements, and bug-fixes. If you encounter an issue, or have a request for further development, please submit it through our GitHub page. The following are features we are planning to implement:   
- Implement a zoom feature for RPYS graphs. This will enable users to interactively zoom in on specific years of interest.   
- Implement interactive network visualizations. These will allow users to see node information as they hover on individual nodes.
