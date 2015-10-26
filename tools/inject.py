
import argparse
import re
import os

parser = argparse.ArgumentParser()
parser.add_argument("-i", "--input")
parser.add_argument("-o", "--output")
args = parser.parse_args()


def process(inpath, outpath):
    regex = re.compile("(.*)@include{([^}]*)}(.*)")
    with open(inpath, "rb") as inf:
        with open(outpath, "wb") as outf:
            for line in inf:
                match = regex.match(line)
                if match:
                    with open(
                        os.path.join(os.path.dirname(inpath),
                                     match.group(2))) as dataf:
                        data = "".join(dataf.readlines())
                    line = match.group(1) + data + match.group(3)
                outf.write(line)


if __name__ == "__main__":
    process(os.path.abspath(args.input), os.path.abspath(args.output))
