export namespace kube {
	
	export class VolumeMount {
	    name: string;
	    mountPath: string;
	    readOnly: boolean;
	
	    static createFrom(source: any = {}) {
	        return new VolumeMount(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.name = source["name"];
	        this.mountPath = source["mountPath"];
	        this.readOnly = source["readOnly"];
	    }
	}
	export class ContainerResource {
	    cpuRequest: string;
	    cpuLimit: string;
	    memoryRequest: string;
	    memoryLimit: string;
	
	    static createFrom(source: any = {}) {
	        return new ContainerResource(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.cpuRequest = source["cpuRequest"];
	        this.cpuLimit = source["cpuLimit"];
	        this.memoryRequest = source["memoryRequest"];
	        this.memoryLimit = source["memoryLimit"];
	    }
	}
	export class ContainerPort {
	    name: string;
	    containerPort: number;
	    protocol: string;
	
	    static createFrom(source: any = {}) {
	        return new ContainerPort(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.name = source["name"];
	        this.containerPort = source["containerPort"];
	        this.protocol = source["protocol"];
	    }
	}
	export class ContainerDetail {
	    name: string;
	    image: string;
	    ready: boolean;
	    state: string;
	    stateDetail: string;
	    restartCount: number;
	    ports: ContainerPort[];
	    resources: ContainerResource;
	    volumeMounts: VolumeMount[];
	
	    static createFrom(source: any = {}) {
	        return new ContainerDetail(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.name = source["name"];
	        this.image = source["image"];
	        this.ready = source["ready"];
	        this.state = source["state"];
	        this.stateDetail = source["stateDetail"];
	        this.restartCount = source["restartCount"];
	        this.ports = this.convertValues(source["ports"], ContainerPort);
	        this.resources = this.convertValues(source["resources"], ContainerResource);
	        this.volumeMounts = this.convertValues(source["volumeMounts"], VolumeMount);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class ContainerInfo {
	    name: string;
	    image: string;
	    ready: boolean;
	    state: string;
	
	    static createFrom(source: any = {}) {
	        return new ContainerInfo(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.name = source["name"];
	        this.image = source["image"];
	        this.ready = source["ready"];
	        this.state = source["state"];
	    }
	}
	
	
	export class Context {
	    name: string;
	    cluster: string;
	    user: string;
	
	    static createFrom(source: any = {}) {
	        return new Context(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.name = source["name"];
	        this.cluster = source["cluster"];
	        this.user = source["user"];
	    }
	}
	export class EventInfo {
	    type: string;
	    reason: string;
	    message: string;
	    source: string;
	    count: number;
	    firstTimestamp: string;
	    lastTimestamp: string;
	    age: string;
	
	    static createFrom(source: any = {}) {
	        return new EventInfo(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.type = source["type"];
	        this.reason = source["reason"];
	        this.message = source["message"];
	        this.source = source["source"];
	        this.count = source["count"];
	        this.firstTimestamp = source["firstTimestamp"];
	        this.lastTimestamp = source["lastTimestamp"];
	        this.age = source["age"];
	    }
	}
	export class PodCondition {
	    type: string;
	    status: string;
	    lastTransitionTime: string;
	    reason: string;
	    message: string;
	
	    static createFrom(source: any = {}) {
	        return new PodCondition(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.type = source["type"];
	        this.status = source["status"];
	        this.lastTransitionTime = source["lastTransitionTime"];
	        this.reason = source["reason"];
	        this.message = source["message"];
	    }
	}
	export class Volume {
	    name: string;
	    type: string;
	    source: string;
	
	    static createFrom(source: any = {}) {
	        return new Volume(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.name = source["name"];
	        this.type = source["type"];
	        this.source = source["source"];
	    }
	}
	export class PodDetail {
	    name: string;
	    namespace: string;
	    uid: string;
	    creationTimestamp: string;
	    labels: Record<string, string>;
	    annotations: Record<string, string>;
	    status: string;
	    ready: string;
	    restarts: number;
	    age: string;
	    nodeName: string;
	    ip: string;
	    hostIP: string;
	    startTime: string;
	    qosClass: string;
	    serviceAccountName: string;
	    restartPolicy: string;
	    conditions: PodCondition[];
	    initContainers: ContainerDetail[];
	    containers: ContainerDetail[];
	    volumes: Volume[];
	
	    static createFrom(source: any = {}) {
	        return new PodDetail(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.name = source["name"];
	        this.namespace = source["namespace"];
	        this.uid = source["uid"];
	        this.creationTimestamp = source["creationTimestamp"];
	        this.labels = source["labels"];
	        this.annotations = source["annotations"];
	        this.status = source["status"];
	        this.ready = source["ready"];
	        this.restarts = source["restarts"];
	        this.age = source["age"];
	        this.nodeName = source["nodeName"];
	        this.ip = source["ip"];
	        this.hostIP = source["hostIP"];
	        this.startTime = source["startTime"];
	        this.qosClass = source["qosClass"];
	        this.serviceAccountName = source["serviceAccountName"];
	        this.restartPolicy = source["restartPolicy"];
	        this.conditions = this.convertValues(source["conditions"], PodCondition);
	        this.initContainers = this.convertValues(source["initContainers"], ContainerDetail);
	        this.containers = this.convertValues(source["containers"], ContainerDetail);
	        this.volumes = this.convertValues(source["volumes"], Volume);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class PodInfo {
	    name: string;
	    namespace: string;
	    status: string;
	    ready: string;
	    restarts: number;
	    age: string;
	    labels: Record<string, string>;
	    nodeName: string;
	    ip: string;
	    containers: ContainerInfo[];
	
	    static createFrom(source: any = {}) {
	        return new PodInfo(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.name = source["name"];
	        this.namespace = source["namespace"];
	        this.status = source["status"];
	        this.ready = source["ready"];
	        this.restarts = source["restarts"];
	        this.age = source["age"];
	        this.labels = source["labels"];
	        this.nodeName = source["nodeName"];
	        this.ip = source["ip"];
	        this.containers = this.convertValues(source["containers"], ContainerInfo);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	

}

