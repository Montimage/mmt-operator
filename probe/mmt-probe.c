/*
 * Description: This program reports periodically protocol statistics
 *   to a REDIS server. It can run live on a given network interface
 *   or offline on a pre-recorded pcap trace file. 
 *
 * Dependencies: MMT SDK, MMT TCPIP plugin, hiredis, libjson, libpcap
 *
 * Author: Bachar Wehbi (bachar.wehbi@montimage.com)
 * 
 * All Rights reserved, Montimage 2014
 */

#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <pcap.h>
#include <unistd.h>
#include "mmt_core.h"
#include <hiredis/hiredis.h>
#include <libjson/libjson.h>

#define __STDC_FORMAT_MACROS
#include <inttypes.h>

#define MAX_FILENAME_SIZE 256
#define TRACE_FILE 1
#define LIVE_INTERFACE 2
#define MTU_BIG (16 * 1024)

static int quiet;
static int period = 30; //default to 30 seconds
static redisContext *redis = NULL;

void usage(const char * prg_name) {
    fprintf(stderr, "%s [<option>]\n", prg_name);
    fprintf(stderr, "Option:\n");
    fprintf(stderr, "\t-t <trace file>: Gives the trace file to analyse.\n");
    fprintf(stderr, "\t-i <interface> : Gives the interface name for live traffic analysis.\n");
    fprintf(stderr, "\t-q             : Be quiet (no output whatsoever, helps profiling).\n");
    fprintf(stderr, "\t-h             : Prints this help.\n");
    exit(1);
}

void parseOptions(int argc, char ** argv, char * filename, int * type) {
    int opt, optcount = 0;
    while ((opt = getopt(argc, argv, "t:i:p:qh")) != EOF) {
        switch (opt) {
            case 't':
                optcount++;
                if (optcount > 1) {
                    usage(argv[0]);
                }
                strncpy((char *) filename, optarg, MAX_FILENAME_SIZE);
                *type = TRACE_FILE;
                break;
            case 'i':
                optcount++;
                if (optcount > 1) {
                    usage(argv[0]);
                }
                strncpy((char *) filename, optarg, MAX_FILENAME_SIZE);
                *type = LIVE_INTERFACE;
                break;
            case 'p':
                period = atoi(optarg);
                break;
            case 'q':
                quiet = 1;
                break;
            case 'h':
            default: usage(argv[0]);
        }
    }

    if (filename == NULL || strcmp(filename, "") == 0) {
        if (*type == TRACE_FILE) {
            fprintf(stderr, "Missing trace file name\n");
        }
        if (*type == LIVE_INTERFACE) {
            fprintf(stderr, "Missing network interface name\n");
        }
        usage(argv[0]);
    }
    return;
}

int proto_hierarchy_ids_to_str(const proto_hierarchy_t * proto_hierarchy, char * dest) {
    int offset = 0;
    if (proto_hierarchy->len < 1) {
        offset += sprintf(dest, ".");
    } else {
        int index = 1;
        offset += sprintf(dest, "%u", proto_hierarchy->proto_path[index]);
        index++;
        for (; index < proto_hierarchy->len && index < 16; index++) {
            offset += sprintf(&dest[offset], ".%u", proto_hierarchy->proto_path[index]);
        }
    }
    return offset;
}

void attributes_iterator(attribute_metadata_t * attribute, uint32_t proto_id, void * args) {
    register_extraction_attribute(args, proto_id, attribute->id);
}

void protocols_iterator(uint32_t proto_id, void * args) {
    iterate_through_protocol_attributes(proto_id, attributes_iterator, args);
}

void protocols_stats_iterator(uint32_t proto_id, void * args) {
    FILE * out_file = stdout; //TODO

    const ipacket_t * ipacket = (ipacket_t *) args;
    if (proto_id <= 1) return; //ignor META and UNknown protocols
    proto_statistics_t * proto_stats = get_protocol_stats(ipacket->mmt_handler, proto_id);
    proto_hierarchy_t proto_hierarchy = {0};
    struct timeval ts = get_last_activity_time(ipacket->mmt_handler);

    while (proto_stats != NULL) {
        get_protocol_stats_path(ipacket->mmt_handler, proto_stats, &proto_hierarchy);
        char path[128];
        char path_str[512];
        proto_hierarchy_to_str(&proto_hierarchy, path_str);
        proto_hierarchy_ids_to_str(&proto_hierarchy, path);

        if(proto_stats->touched) {
            JSONNODE *n = json_new(JSON_NODE);
            json_push_back(n, json_new_i("ts", (double) (ts.tv_sec * 1000 + (int)(ts.tv_usec/1000))));
            json_push_back(n, json_new_a("type", "stats"));

            JSONNODE *e = json_new(JSON_NODE);
            json_set_name(e, "event");
            json_push_back(e, json_new_i("format", 99));
            json_push_back(e, json_new_i("ts", (double) (ts.tv_sec * 1000 + (int)(ts.tv_usec/1000))));
            json_push_back(e, json_new_i("proto", proto_id));
            json_push_back(e, json_new_a("path", path));
            json_push_back(e, json_new_f("scount", (double) proto_stats->sessions_count));
            json_push_back(e, json_new_f("ascount", (double) proto_stats->sessions_count - proto_stats->timedout_sessions_count));
            json_push_back(e, json_new_f("data", (double) proto_stats->data_volume));
            json_push_back(e, json_new_f("payload", (double) proto_stats->payload_volume));
            json_push_back(e, json_new_f("packets", (double) proto_stats->packets_count));
            json_push_back(n, e);

            json_char *jc = json_write_formatted(n);
            /* Publish an event */
            redisReply *reply;
            reply = (redisReply *) redisCommand(redis,"PUBLISH %s.%s %s", path_str, "stats", (char *) jc );
            freeReplyObject(reply);

            json_free(jc);
            json_delete(n);

            fprintf(out_file, "%u,%lu.%lu,%u,%s,"
                    "%"PRIu64",%"PRIi64",%"PRIu64",%"PRIu64",%"PRIu64"\n", 99, ts.tv_sec, ts.tv_usec, proto_id, path,
                    proto_stats->sessions_count, proto_stats->sessions_count - proto_stats->timedout_sessions_count,
                    //proto_stats->sessions_count, ((int64_t) (proto_stats->sessions_count - proto_stats->timedout_sessions_count) > 0)?proto_stats->sessions_count - proto_stats->timedout_sessions_count:0,
                    proto_stats->data_volume, proto_stats->payload_volume, proto_stats->packets_count);
        }

        JSONNODE *n = json_new(JSON_NODE);
        json_push_back(n, json_new_i("ts", (double) (ts.tv_sec * 1000 + (int)(ts.tv_usec/1000))));
        json_push_back(n, json_new_a("type", "endperiod"));
        json_char *jc = json_write_formatted(n);
        /* Publish an event */
        redisReply *reply;
        reply = (redisReply *) redisCommand(redis,"PUBLISH endperiod %s", (char *) jc );
        freeReplyObject(reply);

        json_free(jc);
        json_delete(n);


        reset_statistics(proto_stats);
        proto_stats = proto_stats->next;

    }
}

void packet_handler(const ipacket_t * ipacket, u_char * args) {
    static time_t last_report_time = 0;
    if (last_report_time == 0) {
        last_report_time = ipacket->p_hdr->ts.tv_sec;
        return;
    }

    if ((ipacket->p_hdr->ts.tv_sec - last_report_time) >= period) {
        iterate_through_protocols(protocols_stats_iterator, (void *) ipacket);
        last_report_time = ipacket->p_hdr->ts.tv_sec;
    }
}

void live_capture_callback( u_char *user, const struct pcap_pkthdr *p_pkthdr, const u_char *data )
{
    mmt_handler_t *mmt = (mmt_handler_t*)user;
    struct pkthdr header;
    header.ts = p_pkthdr->ts;
    header.caplen = p_pkthdr->caplen;
    header.len = p_pkthdr->len;
    if (!packet_process( mmt, &header, data )) {
        fprintf(stderr, "Packet data extraction failure.\n");
    }
}

int main(int argc, char** argv) {
    mmt_handler_t *mmt_handler;
    char mmt_errbuf[1024];

    pcap_t *pcap;
    const unsigned char *data;
    struct pcap_pkthdr p_pkthdr;
    char errbuf[1024];
    char filename[MAX_FILENAME_SIZE + 1];
    int type;

    struct pkthdr header;

    quiet = 0;
    parseOptions(argc, argv, filename, &type);

    const char *hostname = "127.0.0.1";
    int port = 6379;

    struct timeval timeout = { 1, 500000 }; // 1.5 seconds
    redis = redisConnectWithTimeout(hostname, port, timeout);
    if (redis == NULL || redis->err) {
        if (redis) {
            printf("Connection error: %s\n", redis->errstr);
            redisFree(redis);
        } else {
            printf("Connection error: can't allocate redis context\n");
        }
        exit(1);
    }

    init_extraction();

    //Initialize an MMT handler
    mmt_handler = mmt_init_handler(DLT_EN10MB, 0, mmt_errbuf);
    if (!mmt_handler) { /* pcap error ? */
        fprintf(stderr, "MMT handler init failed for the following reason: %s\n", mmt_errbuf);
        return EXIT_FAILURE;
    }

    iterate_through_protocols(protocols_iterator, mmt_handler);

    //Register a packet handler, it will be called for every processed packet
    //register_packet_handler(mmt_handler, 1, debug_extracted_attributes_printout_handler /* built in packet handler that will print all of the attributes */, &quiet);

    //Register a packet handler to periodically report protocol statistics
    register_packet_handler(mmt_handler, 2, packet_handler /* built in packet handler that will print all of the attributes */, mmt_handler);

    if (type == TRACE_FILE) {
        pcap = pcap_open_offline(filename, errbuf); // open offline trace
        if (!pcap) { /* pcap error ? */
            fprintf(stderr, "pcap_open failed for the following reason: %s\n", errbuf);
            return EXIT_FAILURE;
        }

        while ((data = pcap_next(pcap, &p_pkthdr))) {
            header.ts = p_pkthdr.ts;
            header.caplen = p_pkthdr.caplen;
            header.len = p_pkthdr.len;
            if (!packet_process(mmt_handler, &header, data)) {
                fprintf(stderr, "Packet data extraction failure.\n");
            }
        }
    } else {
        pcap = pcap_open_live(filename, MTU_BIG, 1, 1000, errbuf);
        if (!pcap) {
            fprintf(stderr, "pcap_open failed for the following reason: %s\n", errbuf);
            return EXIT_FAILURE;
        }
        (void)pcap_loop( pcap, -1, &live_capture_callback, (u_char*)mmt_handler );
    }

    mmt_close_handler(mmt_handler);

    close_extraction();

    pcap_close(pcap);

    redisFree(redis);

    return EXIT_SUCCESS;
}

