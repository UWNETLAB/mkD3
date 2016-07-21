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

minYear = 1900
maxYear = 2000
RC = mk.RecordCollection("/Users/filepath")  # Create the Record Collection you want make a RPYS
                                             # visualization of. Documentation can be found at
                                             # http://networkslab.org/metaknowledge/
fileOut = "/Users/filepath/'name.csv'/" # Specify where the resulting csv should be saved.

def get_multi_data (minYear, maxYear, RC, fileOut):
    dictionary = {"CPY": [],
                  "rank": [],
                  "RPY": []}
    years = range(minYear, maxYear+1)

    for i in years:
        try:
            RCyear = RC.yearSplit(i, i)
            rpys = RCyear.rpys(minYear=minYear, maxYear=maxYear)
            length = len(rpys['year'])
            rpys['CPY'] = [i]*length

            dictionary['CPY'] += rpys['CPY']
            dictionary['rank'] += rpys['rank']
            dictionary['RPY'] += rpys['year']
        except:
            pass

    df = pandas.DataFrame.from_dict(dictionary)

    df.to_csv(fileOut)
