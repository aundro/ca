
import argparse
import re
import os

parser = argparse.ArgumentParser()
parser.add_argument("-i", "--input")
parser.add_argument("-o", "--output")
args = parser.parse_args()

regex = re.compile("(.*)@include{([^}]*)}(.*)")

def process(inpath, outf):
    with open(inpath, "rb") as inf:
        for line in inf:
            match = regex.match(line)
            if match:
                outf.write(match.group(1))
                datapath = os.path.abspath(
                    os.path.join(os.path.dirname(inpath),
                                 match.group(2)))
                process(datapath, outf)
                outf.write(match.group(3))
            else:
                outf.write(line)


if __name__ == "__main__":
    with open(os.path.abspath(args.output), "wb") as outf:
        process(os.path.abspath(args.input), outf)
