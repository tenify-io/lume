export namespace kube {
	
	export class ClusterHealth {
	    connected: boolean;
	    latencyMs: number;
	    serverVersion: string;
	    error: string;
	
	    static createFrom(source: any = {}) {
	        return new ClusterHealth(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.connected = source["connected"];
	        this.latencyMs = source["latencyMs"];
	        this.serverVersion = source["serverVersion"];
	        this.error = source["error"];
	    }
	}
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
	export class DaemonSetCondition {
	    type: string;
	    status: string;
	    lastTransitionTime: string;
	    reason: string;
	    message: string;
	
	    static createFrom(source: any = {}) {
	        return new DaemonSetCondition(source);
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
	export class DaemonSetDetail {
	    name: string;
	    namespace: string;
	    uid: string;
	    creationTimestamp: string;
	    labels: Record<string, string>;
	    annotations: Record<string, string>;
	    desired: number;
	    current: number;
	    ready: number;
	    upToDate: number;
	    available: number;
	    age: string;
	    updateStrategy: string;
	    minReadySeconds: number;
	    revisionHistoryLimit?: number;
	    selector: Record<string, string>;
	    nodeSelector: Record<string, string>;
	    conditions: DaemonSetCondition[];
	    images: string[];
	
	    static createFrom(source: any = {}) {
	        return new DaemonSetDetail(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.name = source["name"];
	        this.namespace = source["namespace"];
	        this.uid = source["uid"];
	        this.creationTimestamp = source["creationTimestamp"];
	        this.labels = source["labels"];
	        this.annotations = source["annotations"];
	        this.desired = source["desired"];
	        this.current = source["current"];
	        this.ready = source["ready"];
	        this.upToDate = source["upToDate"];
	        this.available = source["available"];
	        this.age = source["age"];
	        this.updateStrategy = source["updateStrategy"];
	        this.minReadySeconds = source["minReadySeconds"];
	        this.revisionHistoryLimit = source["revisionHistoryLimit"];
	        this.selector = source["selector"];
	        this.nodeSelector = source["nodeSelector"];
	        this.conditions = this.convertValues(source["conditions"], DaemonSetCondition);
	        this.images = source["images"];
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
	export class DaemonSetInfo {
	    name: string;
	    namespace: string;
	    desired: number;
	    current: number;
	    ready: number;
	    upToDate: number;
	    available: number;
	    age: string;
	    nodeSelector: string;
	    images: string[];
	
	    static createFrom(source: any = {}) {
	        return new DaemonSetInfo(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.name = source["name"];
	        this.namespace = source["namespace"];
	        this.desired = source["desired"];
	        this.current = source["current"];
	        this.ready = source["ready"];
	        this.upToDate = source["upToDate"];
	        this.available = source["available"];
	        this.age = source["age"];
	        this.nodeSelector = source["nodeSelector"];
	        this.images = source["images"];
	    }
	}
	export class DeploymentCondition {
	    type: string;
	    status: string;
	    lastTransitionTime: string;
	    reason: string;
	    message: string;
	
	    static createFrom(source: any = {}) {
	        return new DeploymentCondition(source);
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
	export class DeploymentDetail {
	    name: string;
	    namespace: string;
	    uid: string;
	    creationTimestamp: string;
	    labels: Record<string, string>;
	    annotations: Record<string, string>;
	    ready: string;
	    upToDate: number;
	    available: number;
	    age: string;
	    strategy: string;
	    minReadySeconds: number;
	    revisionHistoryLimit?: number;
	    selector: Record<string, string>;
	    maxSurge: string;
	    maxUnavailable: string;
	    conditions: DeploymentCondition[];
	    images: string[];
	
	    static createFrom(source: any = {}) {
	        return new DeploymentDetail(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.name = source["name"];
	        this.namespace = source["namespace"];
	        this.uid = source["uid"];
	        this.creationTimestamp = source["creationTimestamp"];
	        this.labels = source["labels"];
	        this.annotations = source["annotations"];
	        this.ready = source["ready"];
	        this.upToDate = source["upToDate"];
	        this.available = source["available"];
	        this.age = source["age"];
	        this.strategy = source["strategy"];
	        this.minReadySeconds = source["minReadySeconds"];
	        this.revisionHistoryLimit = source["revisionHistoryLimit"];
	        this.selector = source["selector"];
	        this.maxSurge = source["maxSurge"];
	        this.maxUnavailable = source["maxUnavailable"];
	        this.conditions = this.convertValues(source["conditions"], DeploymentCondition);
	        this.images = source["images"];
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
	export class DeploymentInfo {
	    name: string;
	    namespace: string;
	    ready: string;
	    upToDate: number;
	    available: number;
	    age: string;
	    strategy: string;
	    images: string[];
	
	    static createFrom(source: any = {}) {
	        return new DeploymentInfo(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.name = source["name"];
	        this.namespace = source["namespace"];
	        this.ready = source["ready"];
	        this.upToDate = source["upToDate"];
	        this.available = source["available"];
	        this.age = source["age"];
	        this.strategy = source["strategy"];
	        this.images = source["images"];
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
	export class NodeAddress {
	    type: string;
	    address: string;
	
	    static createFrom(source: any = {}) {
	        return new NodeAddress(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.type = source["type"];
	        this.address = source["address"];
	    }
	}
	export class NodeCondition {
	    type: string;
	    status: string;
	    lastTransitionTime: string;
	    reason: string;
	    message: string;
	
	    static createFrom(source: any = {}) {
	        return new NodeCondition(source);
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
	export class NodeImage {
	    names: string[];
	    sizeBytes: number;
	
	    static createFrom(source: any = {}) {
	        return new NodeImage(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.names = source["names"];
	        this.sizeBytes = source["sizeBytes"];
	    }
	}
	export class NodeTaint {
	    key: string;
	    value: string;
	    effect: string;
	
	    static createFrom(source: any = {}) {
	        return new NodeTaint(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.key = source["key"];
	        this.value = source["value"];
	        this.effect = source["effect"];
	    }
	}
	export class NodeSystemInfo {
	    machineID: string;
	    kernelVersion: string;
	    osImage: string;
	    containerRuntimeVersion: string;
	    kubeletVersion: string;
	    operatingSystem: string;
	    architecture: string;
	
	    static createFrom(source: any = {}) {
	        return new NodeSystemInfo(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.machineID = source["machineID"];
	        this.kernelVersion = source["kernelVersion"];
	        this.osImage = source["osImage"];
	        this.containerRuntimeVersion = source["containerRuntimeVersion"];
	        this.kubeletVersion = source["kubeletVersion"];
	        this.operatingSystem = source["operatingSystem"];
	        this.architecture = source["architecture"];
	    }
	}
	export class NodeResources {
	    cpu: string;
	    memory: string;
	    pods: string;
	    ephemeralStorage: string;
	
	    static createFrom(source: any = {}) {
	        return new NodeResources(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.cpu = source["cpu"];
	        this.memory = source["memory"];
	        this.pods = source["pods"];
	        this.ephemeralStorage = source["ephemeralStorage"];
	    }
	}
	export class NodeDetail {
	    name: string;
	    uid: string;
	    creationTimestamp: string;
	    labels: Record<string, string>;
	    annotations: Record<string, string>;
	    status: string;
	    roles: string;
	    age: string;
	    addresses: NodeAddress[];
	    conditions: NodeCondition[];
	    capacity: NodeResources;
	    allocatable: NodeResources;
	    systemInfo: NodeSystemInfo;
	    taints: NodeTaint[];
	    podCIDR: string;
	    images: NodeImage[];
	
	    static createFrom(source: any = {}) {
	        return new NodeDetail(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.name = source["name"];
	        this.uid = source["uid"];
	        this.creationTimestamp = source["creationTimestamp"];
	        this.labels = source["labels"];
	        this.annotations = source["annotations"];
	        this.status = source["status"];
	        this.roles = source["roles"];
	        this.age = source["age"];
	        this.addresses = this.convertValues(source["addresses"], NodeAddress);
	        this.conditions = this.convertValues(source["conditions"], NodeCondition);
	        this.capacity = this.convertValues(source["capacity"], NodeResources);
	        this.allocatable = this.convertValues(source["allocatable"], NodeResources);
	        this.systemInfo = this.convertValues(source["systemInfo"], NodeSystemInfo);
	        this.taints = this.convertValues(source["taints"], NodeTaint);
	        this.podCIDR = source["podCIDR"];
	        this.images = this.convertValues(source["images"], NodeImage);
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
	
	export class NodeInfo {
	    name: string;
	    status: string;
	    roles: string;
	    age: string;
	    kubeletVersion: string;
	    internalIP: string;
	    externalIP: string;
	    osImage: string;
	    containerRuntime: string;
	    labels: Record<string, string>;
	
	    static createFrom(source: any = {}) {
	        return new NodeInfo(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.name = source["name"];
	        this.status = source["status"];
	        this.roles = source["roles"];
	        this.age = source["age"];
	        this.kubeletVersion = source["kubeletVersion"];
	        this.internalIP = source["internalIP"];
	        this.externalIP = source["externalIP"];
	        this.osImage = source["osImage"];
	        this.containerRuntime = source["containerRuntime"];
	        this.labels = source["labels"];
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
	export class StatefulSetCondition {
	    type: string;
	    status: string;
	    lastTransitionTime: string;
	    reason: string;
	    message: string;
	
	    static createFrom(source: any = {}) {
	        return new StatefulSetCondition(source);
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
	export class VolumeClaimInfo {
	    name: string;
	    storageClass: string;
	    accessModes: string[];
	    storage: string;
	
	    static createFrom(source: any = {}) {
	        return new VolumeClaimInfo(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.name = source["name"];
	        this.storageClass = source["storageClass"];
	        this.accessModes = source["accessModes"];
	        this.storage = source["storage"];
	    }
	}
	export class StatefulSetDetail {
	    name: string;
	    namespace: string;
	    uid: string;
	    creationTimestamp: string;
	    labels: Record<string, string>;
	    annotations: Record<string, string>;
	    ready: string;
	    currentReplicas: number;
	    updatedReplicas: number;
	    age: string;
	    updateStrategy: string;
	    partition?: number;
	    podManagementPolicy: string;
	    serviceName: string;
	    revisionHistoryLimit?: number;
	    minReadySeconds: number;
	    selector: Record<string, string>;
	    volumeClaimTemplates: VolumeClaimInfo[];
	    conditions: StatefulSetCondition[];
	    images: string[];
	
	    static createFrom(source: any = {}) {
	        return new StatefulSetDetail(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.name = source["name"];
	        this.namespace = source["namespace"];
	        this.uid = source["uid"];
	        this.creationTimestamp = source["creationTimestamp"];
	        this.labels = source["labels"];
	        this.annotations = source["annotations"];
	        this.ready = source["ready"];
	        this.currentReplicas = source["currentReplicas"];
	        this.updatedReplicas = source["updatedReplicas"];
	        this.age = source["age"];
	        this.updateStrategy = source["updateStrategy"];
	        this.partition = source["partition"];
	        this.podManagementPolicy = source["podManagementPolicy"];
	        this.serviceName = source["serviceName"];
	        this.revisionHistoryLimit = source["revisionHistoryLimit"];
	        this.minReadySeconds = source["minReadySeconds"];
	        this.selector = source["selector"];
	        this.volumeClaimTemplates = this.convertValues(source["volumeClaimTemplates"], VolumeClaimInfo);
	        this.conditions = this.convertValues(source["conditions"], StatefulSetCondition);
	        this.images = source["images"];
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
	export class StatefulSetInfo {
	    name: string;
	    namespace: string;
	    ready: string;
	    serviceName: string;
	    age: string;
	    images: string[];
	
	    static createFrom(source: any = {}) {
	        return new StatefulSetInfo(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.name = source["name"];
	        this.namespace = source["namespace"];
	        this.ready = source["ready"];
	        this.serviceName = source["serviceName"];
	        this.age = source["age"];
	        this.images = source["images"];
	    }
	}
	
	

}

