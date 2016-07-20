import metaknowledge as mk
import metaknowledge.contour as mkv
# import metaknowledge.tagProcessing as mkt
import networkx as nx
import pandas

# from metaknowledge import tagProcessing as mkt

# RC = mk.RecordCollection("/Users/jilliananderson/Documents/NetLab/mk_d3_script/pos.txt")

imetrics = mk.RecordCollection("/Users/jilliananderson/Documents/NetLab/metaknowledged3/RPYS/rpys/raw_data", cached=True)

# overview = imetrics.glimpse()
# print(overview)

frame = imetrics.standardRPYS(minYear=1900)
df = pandas.DataFrame.from_dict(frame)

df.to_csv("/Users/jilliananderson/Documents/NetLab/metaknowledged3/metaknowledged3/imetrics_rpys.csv")

frame = imetrics.getCitations()

df = pandas.DataFrame.from_dict(frame)
df.to_csv("/Users/jilliananderson/Documents/NetLab/metaknowledged3/metaknowledged3/imetrics_citations.csv")
