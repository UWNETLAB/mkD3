import metaknowledge as mk
import metaknowledge.contour as mkv
# import metaknowledge.tagProcessing as mkt
import networkx as nx
import pandas

# from metaknowledge import tagProcessing as mkt

RC = mk.RecordCollection("/Users/jilliananderson/Documents/NetLab/mk_d3_script/pos.txt")


frame = RC.standardRPYS(minYear=1900)

df = pandas.DataFrame.from_dict(frame)

df.to_csv("/Users/jilliananderson/Documents/NetLab/mk_d3_script/rpys/recs.csv")

frame = RC.getCitations()

df = pandas.DataFrame.from_dict(frame)
df.to_csv("/Users/jilliananderson/Documents/NetLab/mk_d3_script/rpys/cits.csv")
