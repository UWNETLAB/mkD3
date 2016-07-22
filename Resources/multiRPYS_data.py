# *********************************************************************************************
# Copyright (C) 2016 Jillian Anderson
#
# This file is part of the metaknowledged3 framework developed for Dr John McLevey's Networks
# Lab at the University of Waterloo. For more information, see http://networkslab.org/.
#
# metaknowledged3 is free software: you can redistribute it and/or modify it under the terms
# of a GNU General Public License as published by the Free Software Foundation. metaknowledged3
# is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even
# the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.
#
# You should have received a copy of the GNU General Public License along with metaknowledged3.
# If not, see <http://www.gnu.org/licenses/>.
# *********************************************************************************************

import metaknowledge as mk
import pandas

minYear = 1900  # Specify the minimum Year you want to consider
maxYear = 2010  # Specify the maximum Year you want to consider
years = range(minYear, maxYear+1)
RC = mk.RecordCollection("/Users/filepath") # Create the RecordCollection you want to analyze

dictionary = {"CPY": [],
              "rank": [],
              "RPY": []}
for i in years:
    try:
        RCyear = RC.yearSplit(i, i)
        if len(RCyear) > 0:
            rpys = RCyear.rpys(minYear=1900, maxYear=2000)
            length = len(rpys['year'])
            rpys['CPY'] = [i]*length

            dictionary['CPY'] += rpys['CPY']
            dictionary['rank'] += rpys['rank']
            dictionary['RPY'] += rpys['year']
    except:
        pass

df = pandas.DataFrame.from_dict(dictionary)

FileOut = "Users/path/file.csv"  # Specify the path to write the csv to
df.to_csv(FileOut)
