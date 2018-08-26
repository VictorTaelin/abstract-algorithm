class Nodes:
    
    def __init__(self):
        self.nodes = []
        self.steps = []
        self.read('debug.txt')
        self.cur_index = 0
        self.cur_nodes = {i: self.nodes[i] for i in self.steps[0]['mnodes'] if not i in self.steps[0]['rnodes']}

    def __len__(self):
        return len(self.steps)
        
    def __getitem__(self, index):
        if index > self.cur_index:
            add, mnodes, rnodes =  1, 'mnodes', 'rnodes'
        else:
            add, mnodes, rnodes = -1, 'rnodes', 'mnodes'
        
        while self.cur_index != index:
            if add ==  1: self.cur_index += 1
            for i in self.steps[self.cur_index][mnodes]:
                self.cur_nodes[i] = self.nodes[i]
            for i in self.steps[self.cur_index][rnodes]:
                del self.cur_nodes[i]
            if add == -1: self.cur_index -= 1
        return (self.steps[self.cur_index]['gonext'], self.cur_nodes)

        
    def read(self, fileName):
        maxid = -1
        ndids = []
        with open(fileName, 'r') as file:
            lines = iter(file.readlines())
            lines.__next__()
            while True:
                try: 
                    gonext = int(lines.__next__())
                except StopIteration: 
                    break
                remove = [int(i) for i in lines.__next__().split()]
                self.steps.append({'gonext': gonext, 'mnodes': [], 'rnodes': []})
                for line in lines:
                    if line == '\n': break
                    line = [int(i) for i in line.split()]
                    maxid += 1
                    self.nodes.append(line)
                    self.steps[-1]['mnodes'].append(maxid)
                    if len(ndids) > line[0]:
                        if ndids[line[0]] != -1: 
                            self.steps[-1]['rnodes'].append(ndids[line[0]])
                            ndids[line[0]] = -1
                        ndids[line[0]] = maxid
                    else:
                        ndids.append(maxid)
                for indx in remove:
                    if ndids[indx] != -1:
                        self.steps[-1]['rnodes'].append(ndids[indx])
                        ndids[indx] = -1